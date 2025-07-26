
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc, writeBatch, addDoc, serverTimestamp, where, getDoc, setDoc, getCountFromServer } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { counselors } from '@/data/counselors';

export interface Appointment {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    service: string;
    counselor: string;
    counselorId?: string;
    date: string; // yyyy-MM-dd
    time: string;
    totalPrice: string;
    createdAt: Timestamp; 
    status: 'Scheduled' | 'Completed' | 'Canceled' | 'Pending';
    paymentMethod?: 'bKash' | 'Cash';
    addedBy: string;
    paymentMobileNo?: string;
    trxID?: string;
    type?: 'Online' | 'Offline';
}

export interface SerializableAppointment extends Omit<Appointment, 'createdAt'> {
    createdAt: string; 
}

export async function getAppointments(): Promise<SerializableAppointment[]> {
    const appointmentsCollection = collection(db, 'appointments');
    const q = query(appointmentsCollection, orderBy('createdAt', 'desc'));
    const appointmentSnapshot = await getDocs(q);
    
    const appointments = appointmentSnapshot.docs.map(doc => {
        const data = doc.data() as Appointment;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        
        return {
            id: doc.id,
            ...data,
            createdAt,
        };
    });

    return appointments;
}


export async function updateAppointmentStatus(
    id: string, 
    status: 'Scheduled' | 'Completed' | 'Canceled' | 'Pending',
    price?: number
): Promise<{ success: boolean, error?: string }> {
    try {
        const appointmentRef = doc(db, 'appointments', id);
        const updateData: { status: string; totalPrice?: string } = { status };

        if (price !== undefined) {
             if (status === 'Scheduled' && price <= 0) {
                return { success: false, error: "Price must be greater than 0 to schedule a pending appointment." };
            }
            updateData.totalPrice = String(price);
        }

        await updateDoc(appointmentRef, updateData);
        revalidatePath('/admin/appointments');
        return { success: true };
    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, error: 'Could not update appointment status.' };
    }
}

const ManualAppointmentSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    phone: z.string().min(1, "Phone is required."),
    email: z.string().email().optional().or(z.literal('')),
    gender: z.string().optional(),
    date: z.string().min(1, "Date is required."), // Expects yyyy-MM-dd
    time: z.string().min(1, "Time is required."),
    service: z.string().min(1, "Service is required."),
    counselor: z.string().min(1, "Counselor is required."),
    paymentMethod: z.enum(['bKash', 'Cash']),
    paymentMobileNo: z.string().optional(),
    trxID: z.string().optional(),
    totalPrice: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: "Price must be a non-negative number.",
    }),
    status: z.enum(['Scheduled', 'Completed', 'Canceled', 'Pending']),
});

export async function createManualAppointment(data: unknown): Promise<{ success: boolean; error?: string }> {
    const validation = ManualAppointmentSchema.safeParse(data);
    if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        const errorMessage = Object.values(errors).flat().join(' ');
        return { success: false, error: errorMessage };
    }

    const { counselor, firstName, lastName, ...restData } = validation.data;
    const counselorData = counselors.find(c => c.value === counselor);

    const dataToSave = {
        ...restData,
        name: `${firstName} ${lastName}`,
        counselor: counselorData?.name || 'Not Sure', // Store name
        counselorId: counselor, // Store id
        addedBy: 'Reyad', // Hardcoded as requested
        trxID: restData.paymentMethod === 'Cash' ? '' : restData.trxID,
        type: 'Online' as const,
        createdAt: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, 'appointments'), dataToSave);
        revalidatePath('/admin/appointments');
        return { success: true };
    } catch (error) {
        console.error("Error creating manual appointment: ", error);
        return { success: false, error: "Could not create appointment." };
    }
}


const UpdateAppointmentSchema = z.object({
    date: z.string().min(1, "Date is required."), // Expects yyyy-MM-dd
    time: z.string().min(1, "Time is required."),
    service: z.string().min(1, "Service is required."),
    counselor: z.string().min(1, "Counselor is required."),
    totalPrice: z.string().optional().refine(val => val === undefined || val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
        message: "Price must be a non-negative number.",
    }),
});

export async function updateAppointment(id: string, data: unknown): Promise<{ success: boolean; error?: string }> {
    const validation = UpdateAppointmentSchema.safeParse(data);
    if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        const errorMessage = Object.values(errors).flat().join(' ');
        return { success: false, error: errorMessage };
    }

    const counselorData = counselors.find(c => c.value === validation.data.counselor);

    const dataToUpdate = {
        ...validation.data,
        counselor: counselorData?.name || 'Not Sure', // Store name
        counselorId: validation.data.counselor, // Store id
    };

    try {
        const appointmentRef = doc(db, 'appointments', id);
        await updateDoc(appointmentRef, dataToUpdate);
        revalidatePath('/admin/appointments');
        revalidatePath('/dashboard/appointments');
        return { success: true };
    } catch (error) {
        console.error("Error updating appointment: ", error);
        return { success: false, error: "Could not update appointment." };
    }
}


export async function deleteAppointment(id: string): Promise<{ success: boolean }> {
    try {
        await deleteDoc(doc(db, 'appointments', id));
        revalidatePath('/admin/appointments');
        return { success: true };
    } catch (error) {
        console.error("Error deleting appointment: ", error);
        return { success: false };
    }
}

export async function deleteAppointments(ids: string[]): Promise<{ success: boolean }> {
    if (ids.length === 0) {
        return { success: true };
    }
    try {
        const batch = writeBatch(db);
        ids.forEach(id => {
            const appointmentRef = doc(db, "appointments", id);
            batch.delete(appointmentRef);
        });
        await batch.commit();
        revalidatePath('/admin/appointments');
        return { success: true };
    } catch (error) {
        console.error("Error deleting appointments: ", error);
        return { success: false };
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


// PROMO CODE ACTIONS

const PromoCodeSchema = z.object({
    code: z.string().min(1, "Code is required.").max(50, "Code is too long.").transform(val => val.toUpperCase().replace(/\s+/g, '')),
    discountType: z.enum(['percentage', 'fixed'], { required_error: "Discount type is required." }),
    discountValue: z.number().min(0, "Discount value must be non-negative."),
    isActive: z.boolean(),
    expiresAt: z.date().optional(),
    usageLimit: z.number().min(0).int("Usage limit must be a whole number.").optional(),
    description: z.string().optional(),
});

export interface PromoCode {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isActive: boolean;
    expiresAt?: Timestamp;
    usageLimit?: number;
    timesUsed: number;
    description?: string;
    createdAt: Timestamp;
}

export type SerializablePromoCode = Omit<PromoCode, 'createdAt' | 'expiresAt'> & {
    createdAt: string;
    expiresAt?: string;
};

export async function getPromoCodes(): Promise<SerializablePromoCode[]> {
    const promoCodesCollection = collection(db, 'promoCodes');
    const q = query(promoCodesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
        const data = doc.data() as PromoCode;
        return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate().toISOString(),
            expiresAt: data.expiresAt?.toDate().toISOString(),
        };
    });
}

export async function upsertPromoCode(id: string | null, data: unknown): Promise<{ success: boolean; error?: string }> {
    const validation = PromoCodeSchema.safeParse(data);
    if (!validation.success) {
        const errorMessage = validation.error.flatten().fieldErrors;
        return { success: false, error: Object.values(errorMessage).flat().join(' ') };
    }

    const { code, expiresAt, ...rest } = validation.data;

    try {
        const q = query(collection(db, "promoCodes"), where("code", "==", code));
        const existing = await getDocs(q);
        if (!existing.empty && existing.docs[0].id !== id) {
            return { success: false, error: "This promo code already exists." };
        }

        const dataToSave: any = {
            ...rest,
            code,
            expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
        };

        if (id) {
            const promoRef = doc(db, 'promoCodes', id);
            await updateDoc(promoRef, dataToSave);
        } else {
            const newPromoRef = doc(collection(db, 'promoCodes'));
            await setDoc(newPromoRef, {
                ...dataToSave,
                timesUsed: 0,
                createdAt: serverTimestamp(),
            });
        }

        revalidatePath('/admin/promocodes');
        return { success: true };

    } catch (error) {
        console.error("Error upserting promo code:", error);
        return { success: false, error: "Could not save the promo code." };
    }
}

export async function deletePromoCode(id: string): Promise<{ success: boolean }> {
    try {
        await deleteDoc(doc(db, 'promoCodes', id));
        revalidatePath('/admin/promocodes');
        return { success: true };
    } catch (error) {
        console.error("Error deleting promo code:", error);
        return { success: false };
    }
}


// CLIENT ACTIONS

export interface Client {
    id: string;
    uid: string;
    firstName: string;
    lastName: string;
    email: string; // From auth
    mobile: string;
    dob: string;
    gender: string;
    createdAt: Timestamp;
}

export type SerializableClient = Omit<Client, 'createdAt'> & {
    createdAt: string;
};


export async function getClients(): Promise<SerializableClient[]> {
    const clientsCollection = collection(db, 'clients');
    const q = query(clientsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const clients: SerializableClient[] = [];
    for (const doc of snapshot.docs) {
        const data = doc.data();
        clients.push({
            id: doc.id,
            uid: data.uid,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            mobile: data.mobile,
            dob: data.dob,
            gender: data.gender,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        });
    }

    return clients;
}

export async function getTotalClients(): Promise<number> {
    try {
        const clientsCollection = collection(db, 'clients');
        const snapshot = await getCountFromServer(clientsCollection);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting total clients:", error);
        return 0;
    }
}
