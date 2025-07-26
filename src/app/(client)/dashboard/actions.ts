
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, Timestamp, limit } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Appointment } from '@/app/(admin)/admin/actions';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase/firebaseAdmin';


export interface Client {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    dob: string;
    gender: string;
}

export type SerializableClient = Client; // No timestamp to serialize for this one

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mobile: z.string().min(10, 'Please enter a valid mobile number'),
  gender: z.string().min(1, 'Please select your gender'),
});

type ProfileData = z.infer<typeof profileSchema>;


export async function getClientDetails(uid: string): Promise<SerializableClient | null> {
    if (!uid) return null;
    try {
        const clientRef = doc(db, 'clients', uid);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
            const data = clientSnap.data();
            return {
                uid: data.uid,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                mobile: data.mobile,
                dob: data.dob,
                gender: data.gender,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching client details:", error);
        return null;
    }
}

export async function updateClientDetails(uid: string, data: ProfileData): Promise<{ success: boolean; error?: string }> {
    if (!uid) {
        return { success: false, error: 'User not authenticated.' };
    }
    const validation = profileSchema.safeParse(data);
    if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        return { success: false, error: Object.values(errors).flat().join(' ') };
    }

    try {
        const clientRef = doc(db, 'clients', uid);
        await updateDoc(clientRef, validation.data);
        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error) {
        console.error("Error updating client details:", error);
        return { success: false, error: 'Could not update profile.' };
    }
}


export type SerializableAppointment = Omit<Appointment, 'createdAt'> & {
    createdAt: string;
};

export async function getClientAppointments(uid: string): Promise<SerializableAppointment[]> {
    if (!uid) {
        return [];
    }

    try {
        const clientDetails = await getClientDetails(uid);
        if (!clientDetails?.email) {
            console.error(`[Action] No client details or email found for UID: ${uid}`);
            return [];
        }
        
        const appointmentsCollection = collection(db, 'appointments');
        const q = query(
            appointmentsCollection,
            where('email', '==', clientDetails.email)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        const appointments = snapshot.docs.map(doc => {
            const data = doc.data() as Appointment;
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            };
        });
        
        // Sort the appointments in code to avoid composite index requirement
        appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return appointments;

    } catch (error) {
        console.error("[Action] Error fetching client appointments:", error);
        return [];
    }
}

export async function getDashboardStats(uid: string): Promise<{ upcoming: number; completed: number; total: number }> {
    const appointments = await getClientAppointments(uid);
    const now = new Date();

    const upcoming = appointments.filter(apt => {
        const [year, month, day] = apt.date.split('-').map(Number);
        const [hours, minutes] = apt.time.split(':').map(str => parseInt(str, 10));
        // Construct date object using UTC values to prevent timezone offset issues
        const appointmentDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        return apt.status === 'Scheduled' && appointmentDate >= now;
    }).length;

    const completed = appointments.filter(apt => apt.status === 'Completed').length;
    
    return {
        upcoming,
        completed,
        total: appointments.length,
    };
}

export async function getNextAppointment(uid: string): Promise<SerializableAppointment | null> {
    const appointments = await getClientAppointments(uid);
    const now = new Date();

    const upcomingAppointments = appointments
        .filter(apt => {
            const [year, month, day] = apt.date.split('-').map(Number);
            const [hours, minutes] = apt.time.split(':').map(str => parseInt(str, 10));
            const appointmentDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
            return apt.status === 'Scheduled' && appointmentDate >= now;
        })
        .sort((a, b) => {
            const dateA = new Date(Date.UTC(
                ...a.date.split('-').map(Number), 
                ...a.time.split(':').map(str => parseInt(str,10))
            ));
            const dateB = new Date(Date.UTC(
                ...b.date.split('-').map(Number), 
                ...b.time.split(':').map(str => parseInt(str,10))
            ));
            return dateA.getTime() - dateB.getTime();
        });

    return upcomingAppointments[0] || null;
}


export async function updateClientPassword(uid: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
        await adminAuth.updateUser(uid, {
            password: newPassword,
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating password:', error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
