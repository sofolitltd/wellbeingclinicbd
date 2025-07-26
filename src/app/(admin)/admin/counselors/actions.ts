
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, orderBy, Timestamp, where, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';
import { adminAuth } from '@/lib/firebase/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';

const createCounselorSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export async function addCounselor(data: unknown) {
    const validation = createCounselorSchema.safeParse(data);
    if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        return { success: false, error: Object.values(errors).flat().join(' ') };
    }

    const { name, email, password } = validation.data;

    try {
        const q = query(collection(db, "counselors"), where("email", "==", email));
        const existing = await getDocs(q);
        if (!existing.empty) {
            return { success: false, error: "A counselor with this email already exists." };
        }

        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        await setDoc(doc(db, 'counselors', userRecord.uid), {
            uid: userRecord.uid,
            name,
            email,
            tempPassword: password, // Store temporary password
            passwordChanged: false, 
            createdAt: Timestamp.now(),
        });

        revalidatePath('/admin/counselors');
        return { success: true };

    } catch (error: any) {
        console.error("Error adding counselor:", error);
        if (error.code === 'auth/email-already-exists') {
             return { success: false, error: "A counselor with this email already exists in Firebase Authentication." };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unknown error occurred." };
    }
}

export async function deleteCounselor(uid: string): Promise<{ success: boolean; error?: string }> {
    try {
        await adminAuth.deleteUser(uid);
        await deleteDoc(doc(db, 'counselors', uid));
        
        revalidatePath('/admin/counselors');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting counselor:", error);
        if (error.code === 'auth/user-not-found') {
            try {
                await deleteDoc(doc(db, 'counselors', uid));
                revalidatePath('/admin/counselors');
                return { success: true };
            } catch (fsError) {
                 console.error("Error deleting counselor from Firestore:", fsError);
                 return { success: false, error: "Could not delete counselor from database." };
            }
        }
        return { success: false, error: "Could not delete counselor." };
    }
}


export interface Counselor {
    id: string;
    uid: string;
    name: string;
    email: string;
    passwordChanged: boolean;
    tempPassword?: string;
    createdAt: Timestamp;
}

export type SerializableCounselor = Omit<Counselor, 'createdAt'> & {
    createdAt: string;
};

export async function getCounselors(): Promise<SerializableCounselor[]> {
    const counselorsCollection = collection(db, 'counselors');
    const q = query(counselorsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data() as Omit<Counselor, 'id'>;
        return {
            id: doc.id,
            ...data,
            passwordChanged: data.passwordChanged || false,
            createdAt: data.createdAt.toDate().toISOString(),
        };
    });
}

export async function sendCredentialsEmail(email: string, tempPass: string): Promise<{ success: boolean; error?: string }> {
     if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
        console.error("Email service credentials not found in .env file.");
        return { success: false, error: "Email service is not configured on the server." };
    }
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

         const mailOptions = {
            from: `Wellbeing Clinic Admin <${process.env.EMAIL_SERVER_USER}>`,
            to: email,
            subject: 'Your Wellbeing Clinic Counselor Account Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h1 style="color: #0d9488;">Welcome to Wellbeing Clinic</h1>
                    <p>An account has been created for you. Please use the following credentials to log in:</p>
                    <ul style="list-style-type: none; padding: 0;">
                        <li><strong>Email:</strong> ${email}</li>
                        <li>
                            <strong>Temporary Password:</strong>
                            <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 10px; border-radius: 6px; margin-top: 5px; width: fit-content;">
                                <code style="font-family: 'Courier New', Courier, monospace; font-size: 16px; color: #111827;">${tempPass}</code>
                            </div>
                        </li>
                    </ul>
                    <p>We strongly recommend you change this password after your first login from your profile page.</p>
                    <p>
                        <strong>Login here:</strong> 
                        <a href="https://wellbeingclinic.vercel.app/counselor/login" target="_blank" style="color: #0d9488; text-decoration: none;">wellbeingclinic.vercel.app/counselor/login</a>
                    </p>
                    <p>Best regards,<br/>The Wellbeing Clinic Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Failed to send credentials email:", error);
        return { success: false, error: "Failed to send credentials email." };
    }
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
     if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
        console.error("Email service credentials not found in .env file.");
        return { success: false, error: "Email service is not configured on the server." };
    }

    try {
        const resetLink = await adminAuth.generatePasswordResetLink(email);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        const mailOptions = {
            from: `Wellbeing Clinic Admin <${process.env.EMAIL_SERVER_USER}>`,
            to: email,
            subject: 'Password Reset for your Wellbeing Clinic Counselor Account',
            html: `
                <h1>Password Reset Request</h1>
                <p>You are receiving this email because a password reset was requested for your counselor account.</p>
                <p>Please click the link below to set a new password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
                <p>Best regards,<br/>The Wellbeing Clinic Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Failed to send password reset email:", error);
        return { success: false, error: "Failed to send password reset email." };
    }
}

const updatePasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export async function updateCounselorPassword(uid: string, data: unknown): Promise<{ success: boolean; error?: string }> {
    const validation = updatePasswordSchema.safeParse(data);
    if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        return { success: false, error: Object.values(errors).flat().join(' ') };
    }
    const { password } = validation.data;

    try {
        await adminAuth.updateUser(uid, { password });
        
        const counselorRef = doc(db, 'counselors', uid);
        await updateDoc(counselorRef, {
            passwordChanged: true,
            tempPassword: '', // Clear the temporary password
        });

        revalidatePath('/admin/counselors');
        return { success: true };
    } catch (error) {
        console.error("Failed to update password:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Could not update password." };
    }
}
