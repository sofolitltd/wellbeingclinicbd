
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserCog, Calendar, DollarSign, Clock } from 'lucide-react';
import { getDashboardStats, getUpcomingAppointments, SerializableAppointment } from './actions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

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
    const [viewingAppointment, setViewingAppointment] = useState<SerializableAppointment | null>(null);

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
                            <CardTitle>This Week's Appointments</CardTitle>
                            <CardDescription>Appointments scheduled for the current week.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : upcomingAppointments.length > 0 ? (
                                <div className="space-y-2">
                                    {upcomingAppointments.map(apt => (
                                        <button key={apt.id} onClick={() => setViewingAppointment(apt)} className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{apt.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{apt.name}</p>
                                                    <p className="text-sm text-muted-foreground">{apt.counselor} &bull; {apt.service}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-medium text-sm">{format(parse(apt.date, 'yyyy-MM-dd', new Date()), "PPP")}</p>
                                                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1"><Clock className="size-3"/> {apt.time}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments for this week.</p>
                            )}
                        </CardContent>
                    </Card>
                 </div>
            </div>

            {/* View Details Modal */}
            <Dialog open={!!viewingAppointment} onOpenChange={(isOpen) => !isOpen && setViewingAppointment(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Appointment Details</DialogTitle>
                        <DialogDescription>
                            Full details for the appointment booked by {viewingAppointment?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    {viewingAppointment && (
                         <div className="space-y-3 py-4 text-sm">
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Client Name:</span><span>{viewingAppointment.name}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Email:</span><span>{viewingAppointment.email}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Phone:</span><span>{viewingAppointment.phone}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Gender:</span><span>{viewingAppointment.gender || 'N/A'}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Service:</span><span>{viewingAppointment.service}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Counselor:</span><span>{viewingAppointment.counselor}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Date:</span><span>{format(new Date(viewingAppointment.date), "PPP")}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Time:</span><span>{viewingAppointment.time}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Status:</span><span>{viewingAppointment.status}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Payment Method:</span><span>{viewingAppointment.paymentMethod || 'bKash'}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Payment Mobile:</span><span>{viewingAppointment.paymentMobileNo || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Trx ID:</span><span>{viewingAppointment.trxID || 'N/A'}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Total Price:</span><span className="font-bold">৳{viewingAppointment.totalPrice}</span></div>
                             <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Added By:</span><span>{viewingAppointment.addedBy}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Booked On:</span><span>{format(new Date(viewingAppointment.createdAt), "PPp")}</span></div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
