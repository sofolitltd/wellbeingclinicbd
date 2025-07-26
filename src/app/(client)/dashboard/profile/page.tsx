
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useClientAuth } from '@/context/ClientAuthContext';
import { getClientDetails, updateClientDetails, updateClientPassword } from '../actions';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';


const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mobile: z.string().min(10, 'Please enter a valid mobile number'),
  gender: z.string().min(1, 'Please select your gender'),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;


export default function ClientProfilePage() {
    const { user, reauthenticate, updatePassword } = useClientAuth();
    const { toast } = useToast();
    const [isSubmittingProfile, setIsSubmittingProfile] = React.useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    React.useEffect(() => {
        async function fetchClientData() {
            if (user?.uid) {
                setIsLoading(true);
                const clientData = await getClientDetails(user.uid);
                if (clientData) {
                    profileForm.reset({
                        firstName: clientData.firstName,
                        lastName: clientData.lastName,
                        mobile: clientData.mobile,
                        gender: clientData.gender,
                    });
                }
                setIsLoading(false);
            }
        }
        fetchClientData();
    }, [user, profileForm]);

    const onProfileSubmit = async (data: ProfileFormValues) => {
        if (!user) return;
        setIsSubmittingProfile(true);
        const result = await updateClientDetails(user.uid, data);
        if (result.success) {
            toast({ title: 'Profile Updated' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsSubmittingProfile(false);
    };
    
    const onPasswordSubmit = async (data: PasswordFormValues) => {
        if (!user) return;
        setIsSubmittingPassword(true);
        try {
            await updatePassword(data.password);
            toast({ title: "Password Updated Successfully" });
            passwordForm.reset();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: 'destructive',
                title: 'Password Update Failed',
                description: errorMessage,
            });
        }
        setIsSubmittingPassword(false);
    };

    return (
        <>
            <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold tracking-tight">My Profile</h1>
            </header>
            <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
                 <div className="max-w-xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" {...profileForm.register('firstName')} />
                                            {profileForm.formState.errors.firstName && <p className="text-sm text-destructive">{profileForm.formState.errors.firstName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" {...profileForm.register('lastName')} />
                                            {profileForm.formState.errors.lastName && <p className="text-sm text-destructive">{profileForm.formState.errors.lastName.message}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile Number</Label>
                                            <Input id="mobile" type="tel" {...profileForm.register('mobile')} />
                                            {profileForm.formState.errors.mobile && <p className="text-sm text-destructive">{profileForm.formState.errors.mobile.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Controller
                                                control={profileForm.control}
                                                name="gender"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Male</SelectItem>
                                                            <SelectItem value="Female">Female</SelectItem>
                                                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {profileForm.formState.errors.gender && <p className="text-sm text-destructive">{profileForm.formState.errors.gender.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={user?.email || ''} readOnly disabled />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmittingProfile}>
                                        {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Update Password</CardTitle>
                            <CardDescription>Set a new password for your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input id="password" type="password" {...passwordForm.register('password')} />
                                    {passwordForm.formState.errors.password && <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                                    {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmittingPassword}>
                                    {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </>
    )
}
