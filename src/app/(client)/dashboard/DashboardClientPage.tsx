
'use client';

import type { SerializableAppointment } from '@/app/(admin)/admin/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Check, Clock, Stethoscope, Users } from 'lucide-react';
import Link from 'next/link';
import { format, parse } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface DashboardClientPageProps {
    stats: { upcoming: number; completed: number; total: number } | null;
    nextAppointment: SerializableAppointment | null | undefined;
    userName?: string | null;
}

export function DashboardClientPage({ stats, nextAppointment, userName }: DashboardClientPageProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
                Welcome back, {userName || 'Client'}!
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.upcoming ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Your scheduled sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
                        <Check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.completed ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Total sessions attended</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Includes all bookings</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Next Appointment</CardTitle>
                    <CardDescription>
                        {nextAppointment ? 'Here are the details for your next scheduled session.' : 'You have no upcoming appointments.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {nextAppointment ? (
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between gap-2">
                               <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-semibold">{format(parse(nextAppointment.date, 'yyyy-MM-dd', new Date()), "PPP")}</p>
                                    </div>
                               </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Time</p>
                                        <p className="font-semibold">{nextAppointment.time}</p>
                                    </div>
                               </div>
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Counselor</p>
                                        <p className="font-semibold">{nextAppointment.counselor}</p>
                                    </div>
                               </div>
                            </div>
                            <Separator className="my-4"/>
                            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                <Button asChild variant="outline"><Link href="/dashboard/appointments">View All Appointments</Link></Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">Ready to schedule your next session?</p>
                            <Button asChild><Link href="/appointment">Book a New Appointment</Link></Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
