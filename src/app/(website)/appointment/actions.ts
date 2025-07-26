

'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, Timestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import { format, parse } from 'date-fns';
import type { Appointment } from '@/app/(admin)/admin/actions';

// Add the shortId to the SerializableAppointment type
export type SerializableAppointment = Omit<Appointment, 'createdAt'> & {
    createdAt: string;
    shortId?: string; 
};


// Function to generate a short, random, alphanumeric ID
function generateShortId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'WBC-';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


const pendingBookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  gender: z.string(),
  service: z.string(),
  counselor: z.string().min(1, 'Counselor name is required'),
  counselorId: z.string().min(1, 'Counselor ID is required'),
  date: z.string(), // Expecting yyyy-MM-dd format
  time: z.string().min(1, 'Time is required'),
  totalPrice: z.string(),
  paymentID: z.string(),
});

type PendingBookingDetails = z.infer<typeof pendingBookingSchema>;

export async function createPendingAppointment(details: PendingBookingDetails): Promise<{ success: boolean; message: string }> {
  const validation = pendingBookingSchema.safeParse(details);

  if (!validation.success) {
    throw new Error(`Invalid booking details provided: ${validation.error.message}`);
  }
  
  const { firstName, lastName, gender, ...validatedDetails } = validation.data;
  const combinedName = `${firstName} ${lastName}`;
  const shortId = generateShortId();
  
  try {
    await addDoc(collection(db, 'appointments'), {
      ...validatedDetails,
      name: combinedName,
      gender: gender || 'N/A', // Save 'N/A' if gender is empty
      paymentMethod: 'bKash',
      status: 'Pending',
      paymentStatus: 'Pending', 
      addedBy: 'Client',
      meetLink: 'https://meet.google.com/bdm-mqir-biq',
      shortId: shortId, // Save the short ID
      type: 'Online' as const,
      createdAt: serverTimestamp(),
    });

    return { success: true, message: 'Pending appointment created.' };

  } catch (error) {
    console.error('Failed to create pending appointment:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unexpected error occurred while creating the pending appointment.' };
  }
}

export async function updateAppointmentAfterPayment(
    docId: string, 
    data: { 
        status: 'Scheduled' | 'Canceled', 
        paymentStatus: 'Completed' | 'Failed' | 'Canceled',
        trxID?: string, 
        paymentMobileNo?: string 
    }
) {
    const appointmentRef = doc(db, 'appointments', docId);
    await updateDoc(appointmentRef, data);
}

export async function getAppointmentById(id: string): Promise<SerializableAppointment | null> {
    try {
        const appointmentRef = doc(db, 'appointments', id);
        const docSnap = await getDoc(appointmentRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data() as Appointment;
        return {
            ...data,
            id: docSnap.id,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching appointment:", error);
        return null;
    }
}

export async function getAppointmentByShortId(shortId: string): Promise<SerializableAppointment | null> {
    if (!shortId) return null;
    try {
        const q = query(collection(db, "appointments"), where("shortId", "==", shortId), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }
        
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data() as Appointment;
        return {
            ...data,
            id: docSnap.id,
            meetLink: data.meetLink,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching appointment by shortId:", error);
        return null;
    }
}


export async function sendBookingConfirmationEmail(details: any) {
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
        console.error("Email service credentials not found in .env file.");
        return; 
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    const formattedDate = format(parse(details.date, 'yyyy-MM-dd', new Date()), "PPP");
    const sessionUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/session/${details.shortId}`;

    // Send to Admin
    const adminMailOptions = {
        from: `Wellbeing Clinic Admin <${process.env.EMAIL_SERVER_USER}>`,
        to: 'sofolitltd@gmail.com', // Admin email
        subject: `New Appointment Booking: ${details.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h1 style="color: #0d9488;">New Appointment Confirmed</h1>
                <p>A new appointment has been successfully booked and paid for through the website.</p>
                <h2 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Client Details</h2>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Name:</strong> ${details.name}</li>
                    <li><strong>Email:</strong> ${details.email}</li>
                    <li><strong>Phone:</strong> ${details.phone}</li>
                </ul>
                <h2 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Appointment Details</h2>
                 <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Service:</strong> ${details.service}</li>
                    <li><strong>Counselor:</strong> ${details.counselor}</li>
                    <li><strong>Date:</strong> ${formattedDate}</li>
                    <li><strong>Time:</strong> ${details.time}</li>
                    <li><strong>Session Link:</strong> <a href="${sessionUrl}">${sessionUrl}</a></li>
                </ul>
                 <h2 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Payment Details</h2>
                 <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Total Paid:</strong> ৳${details.totalPrice}</li>
                    <li><strong>Transaction ID:</strong> ${details.trxID}</li>
                </ul>
                <p>This appointment has been automatically added to the admin dashboard.</p>
            </div>
        `,
    };

    // Send to Client
    const clientMailOptions = {
        from: `Wellbeing Clinic <${process.env.EMAIL_SERVER_USER}>`,
        to: details.email,
        subject: `Your Appointment is Confirmed!`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h1 style="color: #0d9488;">Your Appointment is Confirmed!</h1>
                <p>Hello ${details.name},</p>
                <p>Thank you for booking with Wellbeing Clinic. Your session has been successfully scheduled. Here are the details:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
                    <ul style="list-style-type: none; padding: 0;">
                        <li><strong>Service:</strong> ${details.service}</li>
                        <li><strong>Counselor:</strong> ${details.counselor}</li>
                        <li><strong>Date:</strong> ${formattedDate}</li>
                        <li><strong>Time:</strong> ${details.time}</li>
                    </ul>
                </div>
                <h2 style="color: #0d9488;">How to Join Your Session</h2>
                <p>Please use the following link to view your appointment details and join the session at the scheduled time. We recommend saving this link.</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${sessionUrl}" style="background-color: #0d9488; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Session</a>
                </p>
                <p>If you have any questions, please feel free to contact us.</p>
                <p>Best regards,<br/>The Wellbeing Clinic Team</p>
            </div>
        `
    };

    try {
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(clientMailOptions)
        ]);
        console.log('Confirmation emails sent successfully to admin and client.');
    } catch (error) {
        console.error('Failed to send confirmation emails:', error);
    }
}


export async function getBookedSlotsForCounselor(counselorId: string): Promise<Record<string, string[]>> {
    if (!counselorId) {
        return {};
    }

    try {
        const appointmentsCollection = collection(db, 'appointments');
        const q = query(
            appointmentsCollection, 
            where('counselorId', '==', counselorId),
            where('status', 'in', ['Scheduled', 'Completed'])
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return {};
        }

        const bookedSlotsByDate: Record<string, string[]> = {};
        querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            const dateStr = data.date as string; // Stored as "yyyy-MM-dd"
            const timeStr = data.time as string;
            
            if (dateStr && timeStr) {
                if (!bookedSlotsByDate[dateStr]) {
                    bookedSlotsByDate[dateStr] = [];
                }
                bookedSlotsByDate[dateStr].push(timeStr);
            }
        });

        return bookedSlotsByDate;
    } catch (error) {
        console.error("Error fetching monthly booked slots for counselor:", error);
        return {}; // Return empty on error
    }
}


export async function validatePromoCode(code: string): Promise<{
    success: boolean;
    discount?: { type: 'percentage' | 'fixed'; value: number };
    error?: string;
}> {
    if (!code) {
        return { success: false, error: "Promo code cannot be empty." };
    }

    const upperCaseCode = code.toUpperCase();
    
    try {
        const promoCodesRef = collection(db, 'promoCodes');
        const q = query(
            promoCodesRef, 
            where('code', '==', upperCaseCode), 
            limit(1)
        );
        
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: "Invalid promo code." };
        }

        const promoDoc = snapshot.docs[0];
        const promoData = promoDoc.data();

        if (!promoData.isActive) {
            return { success: false, error: "This promo code is not active." };
        }

        if (promoData.expiresAt && promoData.expiresAt.toDate() < new Date()) {
            return { success: false, error: "This promo code has expired." };
        }

        if (promoData.usageLimit && promoData.timesUsed >= promoData.usageLimit) {
            return { success: false, error: "This promo code has reached its usage limit." };
        }

        return {
            success: true,
            discount: {
                type: promoData.discountType,
                value: promoData.discountValue,
            }
        };

    } catch (error) {
        console.error("Error validating promo code:", error);
        return { success: false, error: "Could not validate promo code." };
    }
}
