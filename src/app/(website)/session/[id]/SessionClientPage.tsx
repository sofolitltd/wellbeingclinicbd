
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Calendar, Clock, Copy, Info, Stethoscope, User, Video } from 'lucide-react';
import { useClientAuth } from '@/context/ClientAuthContext';
import Link from 'next/link';
import type { SerializableAppointment } from '@/app/(website)/appointment/actions';
import { format, parse } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export function SessionClientPage({ appointment }: { appointment: SerializableAppointment }) {
    const { user, loading } = useClientAuth();
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    
    const isUserViewingOwnAppointment = !loading && user && user.email === appointment.email;
    const sessionUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/session/${appointment.shortId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(sessionUrl).then(() => {
            setIsCopied(true);
            toast({ title: 'Link Copied!' });
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl uppercase tracking-wider">Your Session Details</CardTitle>
                    <CardDescription>
                        Here is the information for your upcoming appointment.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                        <div className="flex items-center gap-3">
                           <User className="size-5 text-primary shrink-0" />
                           <div><p className="font-semibold text-muted-foreground">Name</p><p>{appointment.name}</p></div>
                        </div>
                         <div className="flex items-center gap-3">
                           <Calendar className="size-5 text-primary shrink-0" />
                           <div><p className="font-semibold text-muted-foreground">Date</p><p>{format(parse(appointment.date, 'yyyy-MM-dd', new Date()), "PPP")}</p></div>
                        </div>
                         <div className="flex items-center gap-3">
                           <Stethoscope className="size-5 text-primary shrink-0" />
                           <div><p className="font-semibold text-muted-foreground">Counselor</p><p>{appointment.counselor}</p></div>
                        </div>
                         <div className="flex items-center gap-3">
                           <Clock className="size-5 text-primary shrink-0" />
                           <div><p className="font-semibold text-muted-foreground">Time</p><p>{appointment.time}</p></div>
                        </div>
                    </div>
                     <Alert className="mt-6">
                        <Info className="h-4 w-4" />
                        <AlertTitle>This is Your Unique Session Page</AlertTitle>
                        <AlertDescription>
                          We've also sent this link to your email. Please save it. You will use the "Join Session" button below at your scheduled time.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                     <div className="w-full bg-muted/50 p-2 rounded-md flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-sm truncate px-2">{sessionUrl}</span>
                        <Button variant="ghost" size="icon" onClick={handleCopy} className="shrink-0">
                            <Copy className="size-4" />
                            <span className="sr-only">Copy link</span>
                        </Button>
                    </div>
                    <Button asChild className="w-full font-bold" size="lg">
                        <a href={appointment.meetLink} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-2" />
                            Join Session Now
                        </a>
                    </Button>
                </CardFooter>
            </Card>

             {!loading && !user && (
                 <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Create an Account to Manage Bookings!</AlertTitle>
                    <AlertDescription>
                        <p>To easily view and manage your appointments, we recommend creating an account or logging in with the email address <span className="font-semibold">{appointment.email}</span>.</p>
                        <div className="flex gap-2 mt-3">
                            <Button asChild size="sm"><Link href="/login">Login</Link></Button>
                            <Button asChild variant="outline" size="sm"><Link href="/signup">Sign Up Now</Link></Button>
                        </div>
                    </AlertDescription>
                </Alert>
             )}

              {isUserViewingOwnAppointment && (
                 <Alert variant="default" className="bg-secondary/20 border-secondary">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>You're Logged In!</AlertTitle>
                    <AlertDescription>
                        <p>You can also view and manage this appointment from your client dashboard.</p>
                        <div className="flex gap-2 mt-3">
                            <Button asChild size="sm" variant="secondary"><Link href="/dashboard/appointments">Go to Dashboard</Link></Button>
                        </div>
                    </AlertDescription>
                </Alert>
             )}
        </div>
    )
}
