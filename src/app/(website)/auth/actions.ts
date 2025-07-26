
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SignUpSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email(),
    mobile: z.string().min(1, 'Mobile number is required'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
});

export type SignUpData = z.infer<typeof SignUpSchema>;

export async function signUpClient(uid: string, data: SignUpData) {
    const validation = SignUpSchema.safeParse(data);
    if (!validation.success) {
        throw new Error('Invalid user data provided.');
    }

    try {
        await setDoc(doc(db, 'clients', uid), {
            ...validation.data,
            uid,
            createdAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating client document: ", error);
        throw new Error("Could not save client details.");
    }
}
