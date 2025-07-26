
import { type NextRequest, NextResponse } from "next/server"
import { updateAppointmentAfterPayment, sendBookingConfirmationEmail } from "../../appointment/actions"
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc } from "firebase/firestore";

async function getBkashIdToken() {
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
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("bKash grant token error in callback:", errorText);
        throw new Error("Failed to get authentication token from bKash for payment execution.");
    }

    const tokenData = await tokenResponse.json();
    return tokenData.id_token;
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentID } = body;

    if (!paymentID) {
      return NextResponse.json({ success: false, statusMessage: "Payment ID is missing." }, { status: 400 });
    }

    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("paymentID", "==", paymentID), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.error(`[Callback] Appointment document not found for PaymentID: ${paymentID}`);
        return NextResponse.json({ success: false, statusMessage: "Payment session expired or invalid." }, { status: 404 });
    }

    const appointmentDoc = querySnapshot.docs[0];
    const appointmentDetails = appointmentDoc.data();
    
    const id_token = await getBkashIdToken();

    const response = await fetch(process.env.BKASH_EXECUTE_PAYMENT_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: id_token,
        "x-app-key": process.env.BKASH_API_KEY!,
      },
      body: JSON.stringify({
        paymentID,
      }),
    })

    const data = await response.json()

    if (data && data.statusCode === "0000" && data.transactionStatus === "Completed") {
      
      const updateData = {
        status: 'Scheduled' as const,
        paymentStatus: 'Completed' as const,
        trxID: data.trxID,
        paymentMobileNo: data.customerMsisdn,
      };

      await updateAppointmentAfterPayment(appointmentDoc.id, updateData);
      
      const finalAppointmentDetails = { ...appointmentDetails, ...updateData };
      await sendBookingConfirmationEmail(finalAppointmentDetails);


      return NextResponse.json({
        success: true,
        transactionStatus: data.transactionStatus,
        trxID: data.trxID,
        statusMessage: data.statusMessage,
        appointmentId: appointmentDoc.id, // Return the appointment ID
      })

    } else {
       await updateAppointmentAfterPayment(appointmentDoc.id, { 
         status: 'Canceled', 
         paymentStatus: data.statusMessage === 'Cancelled' ? 'Canceled' : 'Failed'
       });
       console.warn(`[Callback] Payment failed or was canceled for PaymentID: ${paymentID}. Status: ${data.statusMessage}`);
      return NextResponse.json({
        success: false,
        statusMessage: data.statusMessage || "Payment execution failed",
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
