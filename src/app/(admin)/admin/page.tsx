
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCog, Calendar, DollarSign, Clock } from 'lucide-react';
import { getDashboardStats, getUpcomingAppointments, SerializableAppointment } from './actions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parse } from 'date-fns';

interface Stats {
    totalClients: number;
    totalCounselors: number;
    totalAppointments: number;
    totalEarnings: number;
}

export default function OverviewAdminPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<SerializableAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [statsData, appointmentsData] = await Promise.all([
                getDashboardStats(),
                getUpcomingAppointments()
            ]);
            setStats(statsData);
            setUpcomingAppointments(appointmentsData);
            setIsLoading(false);
        }
        fetchData();
    }, []);


    return (
        <>
            <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
            </header>
            <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.totalClients}</div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Counselors</CardTitle>
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.totalCounselors}</div>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.totalAppointments}</div>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">৳{stats?.totalEarnings.toLocaleString()}</div>}
                           <p className="text-xs text-muted-foreground">From completed appointments</p>
                        </CardContent>
                    </Card>
                 </div>
                 <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingAppointments.map(apt => (
                                        <div key={apt.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{apt.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{apt.name}</p>
                                                    <p className="text-sm text-muted-foreground">{apt.service}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-sm">{format(parse(apt.date, 'yyyy-MM-dd', new Date()), "PPP")}</p>
                                                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1"><Clock className="size-3"/> {apt.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments.</p>
                            )}
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </>
    )
}
