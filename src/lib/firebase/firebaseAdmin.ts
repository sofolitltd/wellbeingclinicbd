
// This file should only be imported in server-side code (e.g., Server Actions, API routes).
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file.');
    }
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
