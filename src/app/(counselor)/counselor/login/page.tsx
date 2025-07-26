'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { CounselorAuthProvider, useCounselorAuth } from '@/context/CounselorAuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function CounselorLoginPageContent() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, signIn, loading } = useCounselorAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

     useEffect(() => {
        if (!loading && user) {
            router.push('/counselor/dashboard');
        }
    }, [user, loading, router]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsSubmitting(true);
        try {
            await signIn(data.email, data.password);
            // The useEffect will handle the redirect
        } catch (error) {
             const errorMessage = error instanceof Error && error.message.includes('auth/invalid-credential')
                ? "Invalid email or password."
                : "An error occurred. Please try again.";
            toast({ variant: 'destructive', title: "Login Failed", description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    // If not loading and user is not present, show the login form
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                         <Image
                            src="/wb_logo.png"
                            alt="Wellbeing Clinic Logo"
                            width={60}
                            height={60}
                            className="mx-auto mb-4"
                         />
                        <CardTitle>Counselor Login</CardTitle>
                        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" {...form.register('email')} />
                                 {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} {...form.register('password')} />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute inset-y-0 right-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                                    </Button>
                                </div>
                                 {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-xs text-muted-foreground space-y-1">
                            <p>
                                New counselor? 
                            </p>
                            <p>
                            Please <a href="mailto:wellbeingclinicbd@gmail.com" className="text-primary font-bold hover:underline">Contact Admin</a> to create an account. 
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If still here (e.g., user is present but not yet redirected), show a loader or null.
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

export default function CounselorLoginPage() {
    return (
        <CounselorAuthProvider>
            <CounselorLoginPageContent />
        </CounselorAuthProvider>
    )
}
