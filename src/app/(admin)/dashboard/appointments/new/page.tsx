
'use client'

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { createManualAppointment } from '../../../admin/actions';
import { counselors as allCounselors, holidays } from '@/data/counselors';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarLegend } from '@/components/shared/CalendarLegend';

const availableServices = [
    { value: 'student-counseling', label: 'Student Counseling' },
    { value: 'individual-counseling', label: 'Individual Counseling' },
    { value: 'couple-counseling', label: 'Couple Counseling' },
    { value: 'family-counseling', label: 'Family Counseling' },
];

export default function BookAppointmentAdminPage() {
    const { toast } = useToast();
    const router = useRouter();
    
    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [service, setService] = useState<string | undefined>();
    const [counselor, setCounselor] = useState<string | undefined>();
    const [date, setDate] = useState<Date | undefined>();
    const [time, setTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Cash'>('Cash');
    const [paymentMobileNo, setPaymentMobileNo] = useState('');
    const [trxID, setTrxID] = useState('');
    const [totalPrice, setTotalPrice] = useState('0');
    const [status, setStatus] = useState<'Scheduled' | 'Completed' | 'Canceled' | 'Pending'>('Pending');
    
    // Availability state - not used in admin form but kept for consistency if needed later
    const [monthlyBookedSlots, setMonthlyBookedSlots] = useState<Record<string, string[]>>({});
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableCounselors = useMemo(() => {
        if (!service) return [];
        return allCounselors.filter(c => c.services.includes(service as any));
    }, [service]);
    
    const availableTimes = useMemo(() => {
        if (!counselor || !date) return [];
        const selectedCounselorData = allCounselors.find(c => c.value === counselor);
        if (!selectedCounselorData) return [];
        return selectedCounselorData.times;
    }, [counselor, date]);
    
    useEffect(() => {
        if (counselor && !availableCounselors.some(c => c.value === counselor)) {
            setCounselor(undefined);
        }
    }, [counselor, availableCounselors]);

    useEffect(() => {
        if (time && !availableTimes.includes(time as any)) {
            setTime('');
        }
    }, [time, availableTimes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service || !date || !time || !firstName || !lastName || !phone || !counselor) {
            toast({ variant: "destructive", title: "Incomplete Form", description: "Please fill out all required fields." });
            return;
        }
        setIsSubmitting(true);

        const serviceData = availableServices.find(s => s.value === service);
        
        const appointmentData = {
            firstName, lastName, email, phone, gender,
            service: serviceData?.label || 'N/A',
            counselor,
            date: format(date, "yyyy-MM-dd"),
            time,
            paymentMethod,
            paymentMobileNo,
            trxID,
            totalPrice,
            status,
        };

        const result = await createManualAppointment(appointmentData);

        if (result.success) {
            toast({ title: "Appointment Created", description: `The appointment has been added with '${status}' status.` });
            router.push('/admin/dashboard/appointments');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not create appointment.' });
        }
        setIsSubmitting(false);
    }

    return (
        <>
        <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold tracking-tight">Book a New Appointment</h1>
        </header>
        <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
             <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointment Details</CardTitle>
                            <CardDescription>Fill in the form to manually book an appointment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                                <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" placeholder="+8801234567890" required value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                               <div className="space-y-2"><Label htmlFor="email">Email (Optional)</Label><Input id="email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="gender">Gender</Label><Select value={gender} onValueChange={setGender}><SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2">
                                <Label htmlFor="service">Service</Label>
                                <Select value={service} onValueChange={setService}>
                                    <SelectTrigger id="service"><SelectValue placeholder="Select a service" /></SelectTrigger>
                                    <SelectContent>
                                        {availableServices.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="counselor">Counselor</Label>
                                    <Select value={counselor} onValueChange={setCounselor} disabled={!service}>
                                        <SelectTrigger id="counselor"><SelectValue placeholder={!service ? "Select service first" : "Select a counselor"} /></SelectTrigger>
                                        <SelectContent>
                                            {availableCounselors.map((c) => (<SelectItem key={c.value} value={c.value}>{c.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border">
                                            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(day) => holidays.includes(format(day, 'yyyy-MM-dd'))} initialFocus />
                                            <CalendarLegend />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="time">Time</Label>
                                    <Select value={time} onValueChange={setTime} disabled={!counselor || !date}>
                                        <SelectTrigger id="time">
                                            <SelectValue placeholder={!counselor ? "Select counselor first" : "Select a time"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingSlots && <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin"/></div>}
                                            {!isLoadingSlots && availableTimes.map((t) => (
                                                <SelectItem key={t as string} value={t as string}>{t}</SelectItem>
                                            ))}
                                            {!isLoadingSlots && availableTimes.length === 0 && date && (
                                                <div className="p-2 text-center text-sm text-muted-foreground">No available slots.</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'bKash' | 'Cash')} className="flex items-center space-x-4 pt-2">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Cash" id="r-cash" /><Label htmlFor="r-cash">Cash</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="bKash" id="r-bkash" /><Label htmlFor="r-bkash">Online</Label></div>
                                    </RadioGroup>
                                </div>
                            </div>
                            {paymentMethod === 'bKash' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentMobileNo">Payment Mobile No (Optional)</Label>
                                        <Input id="paymentMobileNo" type="tel" placeholder="Enter payment number" value={paymentMobileNo} onChange={(e) => setPaymentMobileNo(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="trxID">Transaction ID (Optional)</Label>
                                        <Input id="trxID" placeholder="Enter transaction ID" value={trxID} onChange={(e) => setTrxID(e.target.value)} />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input id="price" type="number" placeholder="Enter amount" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} min="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={(value) => setStatus(value as 'Scheduled' | 'Completed' | 'Canceled' | 'Pending')}>
                                        <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Canceled">Canceled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button type="submit" className="font-bold" disabled={isSubmitting}>{isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking...</>) : ('Book Appointment')}</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div>
        </>
    );
}
