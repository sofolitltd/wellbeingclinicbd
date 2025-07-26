
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createPendingAppointment } from "../../appointment/actions"

const createPaymentSchema = z.object({
  amount: z.string().min(1),
  name: z.string().min(1),
  appointmentDetails: z.record(z.any()),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, name, appointmentDetails } = createPaymentSchema.parse(body)

    // Get token for payment creation
    const tokenResponse = await fetch(process.env.BKASH_GRANT_TOKEN_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: process.env.BKASH_USERNAME!,
        password: process.env.BKASH_PASSWORD!,
      },
      body: JSON.stringify({
        app_key: process.env.BKASH_API_KEY!,
        app_secret: process.env.BKASH_SECRET_KEY!,
      }),
    })

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("bKash token error:", errorText);
        throw new Error("Failed to get authentication token from bKash");
    }

    const tokenData = await tokenResponse.json()
    const id_token = tokenData.id_token
    
    // Use environment variable for the base URL.
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseURL) {
        throw new Error("NEXT_PUBLIC_BASE_URL is not set in environment variables.");
    }
    const callbackURL = `${baseURL}/callback`;

    const createPaymentResponse = await fetch(process.env.BKASH_CREATE_PAYMENT_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: id_token,
        "x-app-key": process.env.BKASH_API_KEY!,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: name,
        callbackURL: callbackURL,
        amount: amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: `INV-${Date.now()}`,
      }),
    })
    
    const paymentData = await createPaymentResponse.json();
    
    if (paymentData && paymentData.paymentID) {
      // Create a pending appointment in Firestore
      await createPendingAppointment({
        ...appointmentDetails,
        paymentID: paymentData.paymentID,
        gender: appointmentDetails.gender,
      });
    }

    if (paymentData && paymentData.bkashURL) {
      return NextResponse.json({
        bkashURL: paymentData.bkashURL,
      })
    } else {
      return NextResponse.json(
        {
          error: "Payment creation failed",
          statusMessage: paymentData.statusMessage || "Unknown error",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Create payment error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", issues: error.issues }, { status: 422 })
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

