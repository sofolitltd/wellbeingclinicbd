
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CounselorDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/counselor/clients');
    }, [router]);

    return (
        <>
            <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold tracking-tight">Counselor Dashboard</h1>
            </header>
            <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
                 <p>Redirecting to your clients page...</p>
            </div>
        </>
    )
}
