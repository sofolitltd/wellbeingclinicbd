
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page's sole purpose is to redirect to the counselor dashboard.
export default function CounselorRootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/counselor/dashboard');
    }, [router]);

    return null; // Render nothing as the redirect will happen immediately.
}
