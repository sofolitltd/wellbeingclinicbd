

'use client'

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, Phone, MessageCircle, Facebook } from 'lucide-react';
import { format, addDays, isSameDay, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { getBookedSlotsForCounselor, validatePromoCode } from './actions';
import { counselors } from '@/data/counselors';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useClientAuth } from '@/context/ClientAuthContext';
import { getClientDetailsForAppointment } from '../actions';

const availableServices = [
    { value: 'student-counseling', label: 'Student Counseling', price: 1000, duration: 40 },
    { value: 'individual-counseling', label: 'Individual Counseling', price: 1200, duration: 45 },
    { value: 'couple-counseling', label: 'Couple Counseling', price: 1500, duration: 50 },
    { value: 'family-counseling', label: 'Family Counseling', price: 1800, duration: 60 },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};


export function BookingClientPage({ selectedService, selectedCounselor }: { selectedService?: string, selectedCounselor?: string }) {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useClientAuth();
    
    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [service, setService] = useState<string | undefined>(selectedService);
    const [counselor, setCounselor] = useState<string | undefined>(selectedCounselor);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState('');
    
    // Availability state
    const [monthlyBookedSlots, setMonthlyBookedSlots] = useState<Record<string, string[]>>({});
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Price calculation state
    const [basePrice, setBasePrice] = useState<number | undefined>();
    const [sessionDuration, setSessionDuration] = useState<number | undefined>();
    const [displayPrice, setDisplayPrice] = useState<number | undefined>();
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    useEffect(() => {
        // Pre-fill form if user is logged in
        if (user && !authLoading) {
            setEmail(user.email || '');
            
            const fetchDetails = async () => {
                const details = await getClientDetailsForAppointment(user.uid);
                if (details) {
                    setFirstName(details.firstName || '');
                    setLastName(details.lastName || '');
                    setPhone(details.mobile || '');
                    setGender(details.gender || '');
                }
            };
            fetchDetails();
        }
    }, [user, authLoading]);


    useEffect(() => {
        // To avoid hydration mismatch, we only set the initial date on the client.
        const today = startOfToday();
        setDate(today);
    }, []);

    const fetchMonthlySlots = useCallback(async () => {
        if (!counselor) {
            setMonthlyBookedSlots({});
            return;
        }
        setIsLoadingSlots(true);
        try {
            const slots = await getBookedSlotsForCounselor(counselor);
            setMonthlyBookedSlots(slots);
        } catch (error) {
            console.error("Failed to fetch slots", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not load availability. Please try again."})
        } finally {
            setIsLoadingSlots(false);
        }
    }, [counselor, toast]);

    useEffect(() => {
        fetchMonthlySlots();
    }, [fetchMonthlySlots]);

    // This effect keeps the URL query parameters in sync with the component's state.
    useEffect(() => {
        const current = new URLSearchParams(searchParams.toString());
        const newParams = new URLSearchParams();

        if (service) {
            newParams.set('service', service);
        }
        if (counselor) {
            newParams.set('counselor', counselor);
        }
        
        // Only update if the params have actually changed
        if (current.get('service') !== newParams.get('service') || current.get('counselor') !== newParams.get('counselor')) {
            router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
        }
    }, [service, counselor, pathname, router, searchParams]);

    // Filter available counselors based on the selected service
    const availableCounselors = useMemo(() => {
        if (!service) return [];
        return counselors.filter(c => c.services.includes(service as any));
    }, [service]);

    // Update derived state when service changes
    useEffect(() => {
        if (service) {
            const selectedServiceData = availableServices.find(s => s.value === service);
            setBasePrice(selectedServiceData?.price);
            setSessionDuration(selectedServiceData?.duration);
        } else {
            setBasePrice(undefined);
            setSessionDuration(undefined);
        }
        // If the service changes, we need to check if the current counselor is valid for the new service.
        const isCounselorValidForService = availableCounselors.some(c => c.value === counselor);
        if (!isCounselorValidForService) {
            setCounselor(undefined);
        }
        setTime('');
        setDiscount(0);
    // We add `availableCounselors` and `counselor` to dependencies to handle this reset correctly.
    }, [service, availableCounselors, counselor]);

    // Update final price when base price or discount changes
    useEffect(() => {
        if (basePrice !== undefined) {
            let finalPrice = basePrice - discount;
            if (finalPrice < 0) finalPrice = 0; // Don't allow negative price
            setDisplayPrice(finalPrice);
        } else {
            setDisplayPrice(undefined);
        }
    }, [basePrice, discount]);
    
    // Get available time slots for the selected counselor and date
    const availableTimes = useMemo(() => {
        if (!counselor || !date) return [];
        const selectedCounselorData = counselors.find(c => c.value === counselor);
        if (!selectedCounselorData) return [];
    
        const formattedDate = format(date, "yyyy-MM-dd");
        const bookedSlotsForDay = monthlyBookedSlots[formattedDate] || [];
        
        return selectedCounselorData.times.filter(t => !bookedSlotsForDay.includes(t as string));
    }, [counselor, date, monthlyBookedSlots]);
    
    const next31Days = useMemo(() => {
        const today = startOfToday();
        return Array.from({ length: 31 }, (_, i) => addDays(today, i));
    }, []);

    // Reset time if it's not in the available list
    useEffect(() => {
        if (time && !availableTimes.includes(time as any)) {
            setTime('');
        }
    }, [time, availableTimes]);

    const handleApplyPromo = async () => {
        if (!promoCode || !basePrice) {
            toast({ variant: "destructive", title: "Cannot Apply", description: "Please select a service and enter a code." });
            return;
        }
        setIsApplyingPromo(true);
        const result = await validatePromoCode(promoCode);
        setIsApplyingPromo(false);

        if (result.success && result.discount) {
            let calculatedDiscount = 0;
            if (result.discount.type === 'percentage') {
                calculatedDiscount = basePrice * (result.discount.value / 100);
            } else { // 'fixed'
                calculatedDiscount = result.discount.value;
            }
            setDiscount(calculatedDiscount);
            toast({ title: "Promo Applied!", description: `You received a discount of ৳${calculatedDiscount}.` });
        } else {
            setDiscount(0);
            toast({ variant: 'destructive', title: 'Invalid Code', description: result.error });
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service || !date || !time || !firstName || !lastName || !email || !phone || !counselor || displayPrice === undefined) {
            toast({ variant: "destructive", title: "Incomplete Form", description: "Please fill out all required fields." });
            return;
        }
        setIsSubmitting(true);
        toast({ title: "Redirecting to Payment...", description: "Please complete the payment in the new window." });

        const serviceData = availableServices.find(s => s.value === service);
        const counselorData = counselors.find(c => c.value === counselor);

        try {
            const response = await fetch("/api/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: displayPrice.toString(),
                    name: `${firstName} ${lastName}`,
                    appointmentDetails: {
                        firstName, lastName, email, phone, gender,
                        service: serviceData?.label || 'N/A',
                        counselor: counselorData?.name || 'Not Sure',
                        counselorId: counselor,
                        date: format(date, "yyyy-MM-dd"),
                        time,
                        totalPrice: displayPrice.toString()
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.statusMessage || "Payment request failed");
            }

            const session = await response.json();
            if (session?.bkashURL) {
                window.location.href = session.bkashURL;
            } else {
                throw new Error("Invalid response from payment gateway.");
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: error instanceof Error ? error.message : 'Could not initiate payment.',
            });
            setIsSubmitting(false);
        }
    }

    if (isSubmitting) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center p-8 rounded-lg bg-card shadow-2xl border">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Processing Your Request...</h2>
                    <p className="text-muted-foreground">You are being redirected to the payment page.</p>
                    <p className="text-red-600 font-bold mt-4">Please do not close or refresh this window until your payment is complete.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 md:px-6">
            <motion.div className="text-center mb-12" initial="hidden" animate="show" variants={itemVariants}>
                <h1 className="font-headline text-4xl font-bold tracking-wider sm:text-5xl uppercase">Book an Appointment</h1>
                <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">Follow the steps below to schedule your session with one of our professionals.</p>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start" initial="hidden" animate="show" variants={containerVariants}>
                    {/* Left Column */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader><CardTitle className="font-headline text-2xl uppercase tracking-wider">Session Details</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="service">Service</Label>
                                        <Select value={service} onValueChange={setService}>
                                            <SelectTrigger id="service"><SelectValue placeholder="Select a service" /></SelectTrigger>
                                            <SelectContent>
                                                {availableServices.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="counselor">Counselor</Label>
                                        <Select value={counselor} onValueChange={setCounselor} disabled={!service}>
                                            <SelectTrigger id="counselor"><SelectValue placeholder={!service ? "Select service first" : "Select a counselor"} /></SelectTrigger>
                                            <SelectContent>
                                                {availableCounselors.map((c) => (<SelectItem key={c.value} value={c.value}>{c.name}</SelectItem>))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="border border-secondary rounded-md px-4 py-3 min-h-[90px] flex flex-col justify-center bg-secondary text-secondary-foreground">
                                    {basePrice !== undefined ? (
                                        <>
                                            <p className="text-lg text-bold font-headline">Google Meet Video Counseling</p>
                                            <div className='flex justify-between items-baseline text-right font-headline'>
                                                <p className="text-lg font-semibold flex items-baseline gap-1"><span className="text-xl">৳</span><span className="text-3xl">{basePrice}</span><span className="text-base font-normal text-secondary-foreground/80">/ session</span></p>
                                                <p className="flex items-baseline gap-1"><span className="font-bold text- text-secondary-foreground">{sessionDuration}</span><span className="text-secondary-foreground/80">min</span></p>
                                            </div>
                                        </>
                                    ) : (<p className="text-sm italic text-secondary-foreground/80">Choose a service to see details</p>)}
                                </div>

                                <div className={cn("space-y-4", (!service || !counselor) && "opacity-50 pointer-events-none")}>
                                     <h3 className="font-semibold text-lg">Select Date & Time</h3>
                                    <div className="overflow-x-auto hide-scrollbar pb-2">
                                        <div className="flex space-x-2">
                                            {next31Days.map((day) => (
                                                <Button
                                                    key={day.toString()}
                                                    type="button"
                                                    variant={isSameDay(date || new Date(0), day) ? "default" : "outline"}
                                                    className={cn("flex flex-col h-auto p-2 flex-shrink-0 w-20 text-center")}
                                                    onClick={() => setDate(day)}
                                                >
                                                    <span className="text-xs font-medium">{format(day, 'E')}</span>
                                                    <span className="text-2xl font-bold">{format(day, 'd')}</span>
                                                    <span className="text-xs ">{format(day, "MMM, yy")}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Available Slots for {date ? format(date, 'PPP') : ''}</h4>
                                        {isLoadingSlots ? (
                                            <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin"/></div>
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                {availableTimes.length > 0 ? availableTimes.map(t => (
                                                    <Button
                                                        key={t as string}
                                                        type="button"
                                                        variant={time === t ? "default" : "outline"}
                                                        onClick={() => setTime(t as string)}
                                                    >
                                                        {t}
                                                    </Button>
                                                )) : (
                                                    <p className="text-sm text-muted-foreground col-span-full text-center p-4">No available slots for this day.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Column */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader><CardTitle className="font-headline text-2xl uppercase tracking-wider">Personal Information</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="john.doe@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" placeholder="+8801234567890" required value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="gender">Gender</Label><Select value={gender} onValueChange={setGender}><SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select></div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="promo">Promo Code</Label>
                                    <div className="flex gap-4">
                                        <Input id="promo" placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value.replace(/\s/g, '').toUpperCase())} />
                                        <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={isApplyingPromo}>
                                            {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Apply'}
                                        </Button>
                                    </div>
                                </div>
                                {discount > 0 && (
                                    <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Original Price:</span><span>৳{basePrice}</span></div><div className="flex justify-between text-primary"><span className="font-medium">Discount:</span><span className="font-medium">- ৳{discount}</span></div><div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total:</span><span>৳{displayPrice}</span></div></div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="payment">Payment Method</Label>
                                    <RadioGroup defaultValue="bKash" id="payment" className="mt-2"><div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30"><RadioGroupItem value="bKash" id="r1" /><Label htmlFor="r1" className="flex items-center gap-2 cursor-pointer"><Image src="https://cdn.worldvectorlogo.com/logos/bkash.svg" alt="bKash Logo" width={60} height={24} /></Label></div></RadioGroup>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full font-bold" disabled={isSubmitting || isApplyingPromo}>{isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking...</>) : (`Confirm & Pay ৳${displayPrice ?? basePrice ?? ''}`)}</Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </motion.div>
            </form>
            <motion.div className="mt-16 max-w-7xl mx-auto" initial="hidden" animate="show" variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                    <div>
                        <div className="space-y-6">
                            <h2 className="font-headline text-3xl font-bold tracking-wider uppercase text-left">How It Works</h2>
                            <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
                                <li>Select your desired service, counselor, and a date and time that works for you.</li>
                                <li>Provide your name and email. Once confirmed, you'll receive an email with your appointment details.</li>
                                <li>For video sessions, a secure link will be included in your confirmation email.</li>
                                <li>Your privacy is our priority. All information is kept strictly confidential according to our policy.</li>
                                <li>Sessions are 50 minutes, providing a dedicated space for you to discuss your concerns.</li>
                                <li>Our team may follow up to offer further support or guidance if needed.</li>
                                <li>Please note: Our counselors do not prescribe medication. This is handled by our psychiatric services.</li>
                            </ol>
                        </div>
                    </div>
                    <div>
                        <div className="space-y-6">
                            <h2 className="font-headline text-3xl font-bold tracking-wider uppercase text-left">Need Help?</h2>
                            <p className="text-muted-foreground">If you're having trouble making an appointment, feel free to reach out to us directly.</p>
                            <div className="space-y-4">
                                <a href="tel:+8801823161333" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"><Phone className="h-6 w-6 text-primary" /><div><p className="font-semibold">Call Us</p><p className="text-sm text-muted-foreground">+88 01823 161 333</p></div></a>
                                <a href="https://wa.me/8801823161333" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"><MessageCircle className="h-6 w-6 text-primary" /><div><p className="font-semibold">WhatsApp</p><p className="text-sm text-muted-foreground">+88 01823 161 333</p></div></a>
                                <a href="https://web.facebook.com/wellbeingclinicbd" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"><Facebook className="h-6 w-6 text-primary" /><div><p className="font-semibold">Facebook</p><p className="text-sm text-muted-foreground">wellbeingclinicbd</p></div></a>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
