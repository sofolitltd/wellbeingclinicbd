
'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Calendar, Clock, Stethoscope, User, AlertTriangle, Link as LinkIcon, Save, Copy } from 'lucide-react';
import { useClientAuth } from '@/context/ClientAuthContext';
import Link from 'next/link';
import type { SerializableAppointment } from '@/app/(website)/appointment/actions';
import { format, parse } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function PaymentConfirmationClientPage({ appointment }: { appointment: SerializableAppointment }) {
    const { toast } = useToast();
    const { user, loading } = useClientAuth();
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        toast({ title: "Appointment Confirmed!", description: "Your booking was successful." });
    }, [toast]);

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
            <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full p-4 w-fit">
                        <CheckCircle className="size-12 text-green-600" />
                    </div>
                    <CardTitle className="font-headline text-3xl uppercase tracking-wider mt-4">Appointment Confirmed!</CardTitle>
                    <CardDescription>
                        Your payment was successful and appointment is confirmed. A confirmation email will be sent shortly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-left space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                    <Separator />

                    {!loading && !user && (
                        <div className="text-center bg-muted/50 p-4 rounded-lg">
                            <p className="font-semibold text-base flex items-center justify-center gap-2">
                                <Save className="size-5" /> Your Session Link
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 mb-2">
                                Save this link to join your session.
                                We’ll email it to you as well. Need help? Call us at 01823161333.


                            </p>
                            <div className="bg-background p-2 rounded-md flex items-center justify-between gap-2">
                                <a
                                    href={sessionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm break-all text-left"
                                >
                                    {sessionUrl}
                                </a>
                                <Button variant="ghost" size="icon" onClick={handleCopy} className="shrink-0">
                                    <Copy className="size-4" />
                                    <span className="sr-only">Copy link</span>
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button asChild className="w-full">
                        <Link href="/">Go to Homepage</Link>
                    </Button>
                    {isUserViewingOwnAppointment && (
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/dashboard/appointments">View All Appointments</Link>
                        </Button>
                    )}
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
        </div>
    )
}
