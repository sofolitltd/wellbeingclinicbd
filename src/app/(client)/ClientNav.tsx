
'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Calendar, User, LogOut } from "lucide-react";
import { useClientAuth } from "@/context/ClientAuthContext";

export function ClientNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logOut } = useClientAuth();

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard />, active: pathname === '/dashboard' },
        { href: '/dashboard/appointments', label: 'My Appointments', icon: <Calendar />, active: pathname.startsWith('/dashboard/appointments') },
        { href: '/dashboard/profile', label: 'Profile', icon: <User />, active: pathname.startsWith('/dashboard/profile') },
    ];

     const onSignOut = async () => {
        try {
            await logOut();
            router.push('/');
        } catch (error) {
            console.error("Failed to sign out", error);
        }
    };

    return (
        <SidebarMenu className="p-2 space-y-1">
            {navLinks.map(link => (
                <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={link.active} tooltip={link.label}>
                        <Link href={link.href}>
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
             <SidebarMenuItem className="mt-auto">
                <SidebarMenuButton tooltip="Logout" onClick={onSignOut}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
