
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useClientAuth } from '@/context/ClientAuthContext';
import { getDashboardStats, getNextAppointment } from './actions';
import { useEffect, useState } from 'react';
import type { SerializableAppointment } from '@/app/(admin)/admin/actions';
import { DashboardClientPage } from './DashboardClientPage';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-48" />
        </div>
    )
}

export default function ClientDashboardPage() {
    const { user, loading: authLoading } = useClientAuth();
    const [stats, setStats] = useState<{ upcoming: number; completed: number; total: number } | null>(null);
    const [nextAppointment, setNextAppointment] = useState<SerializableAppointment | null | undefined>(undefined); // undefined means not yet fetched
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (user?.uid) {
                setIsLoading(true);
                const [statsData, nextAppointmentData] = await Promise.all([
                    getDashboardStats(user.uid),
                    getNextAppointment(user.uid)
                ]);
                setStats(statsData);
                setNextAppointment(nextAppointmentData);
                setIsLoading(false);
            }
        }
        
        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    return (
        <>
            <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold tracking-tight">Client Dashboard</h1>
            </header>
            <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
                 {isLoading || authLoading ? (
                     <DashboardSkeleton />
                 ) : (
                    <DashboardClientPage 
                        stats={stats} 
                        nextAppointment={nextAppointment}
                        userName={user?.displayName?.split(' ')[0]} 
                    />
                 )}
            </div>
        </>
    )
}
