
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import type { SerializableAppointment } from '@/app/(admin)/admin/actions';

// This function fetches clients for a specific counselor based on their UID.
export async function getCounselorClients(uid: string): Promise<SerializableAppointment[]> {
    console.log(`[Server Action] Starting getCounselorClients for UID: ${uid}`);

    if (!uid) {
        console.error("[Server Action] Error: UID is missing.");
        return [];
    }

    try {
        // Step 1: Find the counselor's document using their UID to get their name.
        const counselorsRef = collection(db, 'counselors');
        const counselorQuery = query(counselorsRef, where('uid', '==', uid));
        const counselorSnapshot = await getDocs(counselorQuery);

        if (counselorSnapshot.empty) {
            console.log(`[Server Action] No counselor found in 'counselors' collection for UID: ${uid}`);
            return [];
        }

        const counselorDoc = counselorSnapshot.docs[0];
        const counselorName = counselorDoc.data().name;
        console.log(`[Server Action] Found counselor name: "${counselorName}" for UID: ${uid}`);

        // Step 2: Use the counselor's name to fetch their appointments.
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(appointmentsRef, where('counselor', '==', counselorName));
        const appointmentSnapshot = await getDocs(appointmentsQuery);
        
        console.log(`[Server Action] Found ${appointmentSnapshot.docs.length} appointments for counselor: "${counselorName}"`);

        if (appointmentSnapshot.empty) {
            return [];
        }

        // Process and serialize the appointments data.
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
            } as SerializableAppointment;
        });

        return clients;

    } catch (error) {
        console.error("[Server Action] Error fetching counselor clients:", error);
        return [];
    }
}
