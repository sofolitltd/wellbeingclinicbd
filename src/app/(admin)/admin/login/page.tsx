
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/context/AdminAuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, signIn, loading } = useAdminAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

     useEffect(() => {
        // If the user is logged in, redirect them away from the login page.
        if (!loading && user) {
            router.push('/admin');
        }
    }, [user, loading, router]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: '', password: '' },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await signIn(data.username, data.password);
            if (!result.success) {
                toast({ variant: 'destructive', title: "Login Failed", description: result.error });
            }
            // The useEffect will handle successful redirect
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: 'destructive', title: "Login Failed", description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // If loading or if user exists (and is about to be redirected), show loader.
    if (loading || user) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    // If not loading and no user, show the login form.
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
                    <CardTitle>Admin Login</CardTitle>
                    <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" placeholder="admin_user" {...form.register('username')} />
                             {form.formState.errors.username && <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? 'text' : 'password'} {...form.register('password')} placeholder="********" autoComplete="new-password" />
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
                </CardContent>
            </Card>
        </div>
    );
}
