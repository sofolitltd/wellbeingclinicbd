
'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, User, LogOut } from "lucide-react";
import { useCounselorAuth } from "@/context/CounselorAuthContext";

export function CounselorNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logOut } = useCounselorAuth();

    const navLinks = [
        { href: '/counselor/dashboard', label: 'Dashboard', icon: <LayoutDashboard />, active: pathname === '/counselor/dashboard' },
        { href: '/counselor/clients', label: 'My Clients', icon: <Users />, active: pathname.startsWith('/counselor/clients') },
        { href: '/counselor/profile', label: 'Profile', icon: <User />, active: pathname.startsWith('/counselor/profile') },
    ];

    const onSignOut = async () => {
        try {
            await logOut();
            router.push('/counselor/login');
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
