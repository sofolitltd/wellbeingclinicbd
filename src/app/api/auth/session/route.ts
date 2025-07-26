
import { adminAuth } from '@/lib/firebase/firebaseAdmin';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';


async function getAppRouterSession() {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    return null;
  }
}


const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: NextRequest) {
    const { idToken } = await request.json();

    try {
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        cookies().set('session', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expiresIn,
            path: '/',
        });

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error("Error creating session cookie:", error);
        return NextResponse.json({ status: 'error', message: 'Failed to create session cookie' }, { status: 401 });
    }
}


export async function DELETE() {
    try {
        cookies().delete('session');
        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error("Error deleting session cookie:", error);
        return NextResponse.json({ status: 'error', message: 'Failed to delete session cookie' }, { status: 500 });
    }
}

