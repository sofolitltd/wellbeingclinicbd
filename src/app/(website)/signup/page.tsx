
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useClientAuth } from '@/context/ClientAuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  mobile: z.string().min(10, { message: "Please enter a valid mobile number." }),
  dob_day: z.string().min(1, { message: "Day is required." }),
  dob_month: z.string().min(1, { message: "Month is required." }),
  dob_year: z.string().min(1, { message: "Year is required." }),
  gender: z.string().min(1, { message: "Please select your gender." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function ClientSignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, signUp, loading } = useClientAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormValues) => {
        setIsSubmitting(true);
        try {
            const { email, password, dob_day, dob_month, dob_year, ...restData } = data;
            
            const dob = new Date(parseInt(dob_year), parseInt(dob_month) - 1, parseInt(dob_day));

            if (isNaN(dob.getTime())) {
                toast({ variant: 'destructive', title: "Invalid Date", description: "Please select a valid date of birth." });
                setIsSubmitting(false);
                return;
            }
            
            await signUp(email, password, {
                ...restData,
                dob: format(dob, "yyyy-MM-dd")
            });
            toast({ title: "Account Created!", description: "Welcome! You are now logged in." });
            router.push('/dashboard');
        } catch (error) {
             const errorMessage = error instanceof Error && error.message.includes('auth/email-already-in-use')
                ? "An account with this email already exists."
                : "An error occurred. Please try again.";
            toast({ variant: 'destructive', title: "Sign Up Failed", description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
    const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));


    if (loading || user) {
        return (
             <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    return (
        <>
            <Breadcrumbs items={[{ label: 'Sign Up' }]} />
            <div className="container mx-auto px-4 py-16 md:px-6 flex items-center justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <CardTitle>Create Your Client Account</CardTitle>
                        <CardDescription>Join our community to manage your wellness journey.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" {...form.register('firstName')} />
                                    {form.formState.errors.firstName && <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" {...form.register('lastName')} />
                                    {form.formState.errors.lastName && <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>}
                                </div>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input id="mobile" type="tel" {...form.register('mobile')} />
                                    {form.formState.errors.mobile && <p className="text-sm text-destructive">{form.formState.errors.mobile.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Controller
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.gender && <p className="text-sm text-destructive">{form.formState.errors.gender.message}</p>}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <div className="grid grid-cols-3 gap-2">
                                     <Controller
                                        control={form.control}
                                        name="dob_day"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                                                <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )}
                                    />
                                     <Controller
                                        control={form.control}
                                        name="dob_month"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                                                <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )}
                                    />
                                     <Controller
                                        control={form.control}
                                        name="dob_year"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                                                <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                {(form.formState.errors.dob_day || form.formState.errors.dob_month || form.formState.errors.dob_year) && <p className="text-sm text-destructive">Please select a valid date of birth.</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...form.register('email')} />
                                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                 <div className="relative">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="********" {...form.register('password')} />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute inset-y-0 right-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center gap-2">
                         <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Button variant="link" asChild className="p-0">
                                <Link href="/login">Log in</Link>
                            </Button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
