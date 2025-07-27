
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, doc, getDoc } from 'firebase/firestore';
import type { SerializableAppointment } from '@/app/(admin)/admin/actions';

// This function fetches clients for a specific counselor based on their UID.
export async function getCounselorClients(uid: string): Promise<SerializableAppointment[]> {
    if (!uid) {
        console.error("[Server Action] Error: UID is missing.");
        return [];
    }

    try {
        const counselorRef = doc(db, 'counselors', uid);
        const counselorSnap = await getDoc(counselorRef);

        if (!counselorSnap.exists()) {
            console.log(`[Server Action] No counselor found in 'counselors' collection for UID: ${uid}`);
            return [];
        }

        const counselorName = counselorSnap.data().name;

        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(appointmentsRef, where('counselor', '==', counselorName), orderBy('createdAt', 'desc'));
        const appointmentSnapshot = await getDocs(appointmentsQuery);
        
        if (appointmentSnapshot.empty) {
            return [];
        }

        const clients = appointmentSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
            
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                service: data.service,
                counselor: data.counselor,
                counselorId: data.counselorId,
                date: data.date,
                time: data.time,
                totalPrice: data.totalPrice,
                createdAt,
                status: data.status,
                addedBy: data.addedBy,
                meetLink: data.meetLink,
            } as SerializableAppointment;
        });

        return clients;

    } catch (error) {
        console.error("[Server Action] Error fetching counselor clients:", error);
        return [];
    }
}
