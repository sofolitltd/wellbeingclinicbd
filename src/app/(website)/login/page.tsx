
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function ClientLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, signIn, loading } = useClientAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
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
            toast({ title: "Login Successful", description: "Welcome back!" });
            router.push('/dashboard');
        } catch (error) {
             const errorMessage = error instanceof Error && error.message.includes('auth/invalid-credential')
                ? "Invalid email or password."
                : "An error occurred. Please try again.";
            toast({ variant: 'destructive', title: "Login Failed", description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || user) {
        return (
             <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    return (
        <>
            <Breadcrumbs items={[{ label: 'Login' }]} />
            <div className="container mx-auto px-4 py-16 md:px-6 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>Client Login</CardTitle>
                        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" {...form.register('email')} autoComplete="email" />
                                 {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="********" {...form.register('password')} autoComplete="current-password" />
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
                                Login
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center gap-2">
                         <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Button variant="link" asChild className="p-0">
                                <Link href="/signup">Sign up now</Link>
                            </Button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
