
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// This is a new server action file for website-specific, non-auth actions.
export async function getClientDetailsForAppointment(uid: string) {
    if (!uid) return null;
    try {
        const clientRef = doc(db, 'clients', uid);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
            const data = clientSnap.data();
            return {
                firstName: data.firstName,
                lastName: data.lastName,
                mobile: data.mobile,
                gender: data.gender,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching client details for appointment:", error);
        return null;
    }
}

