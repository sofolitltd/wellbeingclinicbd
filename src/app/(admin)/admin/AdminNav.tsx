
'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarRange, LayoutDashboard, FileText, Users, ChevronRight, List, PlusCircle, LayoutList, PanelRightOpen, Ticket, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";


export function AdminNav() {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    const isAppointmentsActive = pathname.startsWith('/admin/appointments');
    const isBlogsActive = pathname.startsWith('/admin/blogs');
    const isPromoCodesActive = pathname.startsWith('/admin/promocodes');
    const isCounselorsActive = pathname.startsWith('/admin/counselors');

    const [isAppointmentsOpen, setAppointmentsOpen] = useState(isAppointmentsActive);
    const [isBlogsOpen, setBlogsOpen] = useState(isBlogsActive);
    const [isPromoCodesOpen, setPromoCodesOpen] = useState(isPromoCodesActive);
    const [isCounselorsOpen, setCounselorsOpen] = useState(isCounselorsActive);
    
    const [isMobileAppointmentsOpen, setMobileAppointmentsOpen] = useState(false);
    const [isMobileBlogsOpen, setMobileBlogsOpen] = useState(false);
    const [isMobilePromoCodesOpen, setMobilePromoCodesOpen] = useState(false);
    const [isMobileCounselorsOpen, setMobileCounselorsOpen] = useState(false);

    const baseNavLinks = [
        { href: '/admin', label: 'Overview', icon: <LayoutDashboard />, active: pathname === '/admin' },
        { href: '/admin/clients', label: 'Clients', icon: <Users />, active: pathname.startsWith('/admin/clients') },
    ];

    const appointmentSubLinks = [
        { href: '/admin/appointments', label: 'All Appointments', icon: <List /> },
        { href: '/admin/appointments/new', label: 'Book Appointment', icon: <PlusCircle /> },
    ];

    const blogSubLinks = [
        { href: '/admin/blogs', label: 'All Posts', icon: <List /> },
        { href: '/admin/blogs/new', label: 'Add New', icon: <PlusCircle /> },
        { href: '/admin/blogs/categories', label: 'Categories', icon: <LayoutList /> },
    ];

    const promoCodeSubLinks = [
        { href: '/admin/promocodes', label: 'All Codes', icon: <List /> },
        { href: '/admin/promocodes/new', label: 'Add New', icon: <PlusCircle /> },
    ];

    const counselorSubLinks = [
        { href: '/admin/counselors', label: 'All Counselors', icon: <List /> },
        { href: '/admin/counselors/new', label: 'Add New', icon: <PlusCircle /> },
    ];

    const renderSubMenu = (links: typeof appointmentSubLinks) => (
         <ul className="p-2 space-y-1">
            {links.map(link => (
                <li key={link.href}>
                    <Link href={link.href} className={cn("flex items-center gap-2 p-2 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", pathname === link.href && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}>
                        {link.icon}
                        <span>{link.label}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );

    if (isMobile) {
        return (
            <>
                <SidebarMenu className="p-2 space-y-1">
                    {baseNavLinks.map(link => (
                        <SidebarMenuItem key={link.href}>
                            <SidebarMenuButton asChild isActive={link.active}>
                                <Link href={link.href}>
                                    {link.icon}<span>{link.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                        <SidebarMenuButton isActive={isCounselorsActive} onClick={() => setMobileCounselorsOpen(true)}>
                            <UserCog /><span>Counselors</span><PanelRightOpen className="ml-auto" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton isActive={isAppointmentsActive} onClick={() => setMobileAppointmentsOpen(true)}>
                            <CalendarRange /><span>Appointments</span><PanelRightOpen className="ml-auto" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton isActive={isPromoCodesActive} onClick={() => setMobilePromoCodesOpen(true)}>
                            <Ticket /><span>Promo Codes</span><PanelRightOpen className="ml-auto" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton isActive={isBlogsActive} onClick={() => setMobileBlogsOpen(true)}>
                            <FileText /><span>Blogs</span><PanelRightOpen className="ml-auto" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <Sheet open={isMobileCounselorsOpen} onOpenChange={setMobileCounselorsOpen}>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Counselors</SheetTitle></SheetHeader>
                        {renderSubMenu(counselorSubLinks)}
                    </SheetContent>
                </Sheet>
                <Sheet open={isMobileAppointmentsOpen} onOpenChange={setMobileAppointmentsOpen}>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Appointments</SheetTitle></SheetHeader>
                        {renderSubMenu(appointmentSubLinks)}
                    </SheetContent>
                </Sheet>
                 <Sheet open={isMobilePromoCodesOpen} onOpenChange={setMobilePromoCodesOpen}>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Promo Codes</SheetTitle></SheetHeader>
                        {renderSubMenu(promoCodeSubLinks)}
                    </SheetContent>
                </Sheet>
                 <Sheet open={isMobileBlogsOpen} onOpenChange={setMobileBlogsOpen}>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Blogs</SheetTitle></SheetHeader>
                        {renderSubMenu(blogSubLinks)}
                    </SheetContent>
                </Sheet>
            </>
        )
    }

    return (
        <SidebarMenu className="p-2 space-y-1">
            {baseNavLinks.map(link => (
                <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={link.active} tooltip={link.label}>
                        <Link href={link.href}>
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}

            <Collapsible open={isCounselorsOpen} onOpenChange={setCounselorsOpen}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isCounselorsActive} className="justify-between w-full" tooltip="Counselors">
                            <div className="flex items-center gap-2">
                                <UserCog />
                                <span>Counselors</span>
                            </div>
                            <ChevronRight className={cn("size-4 transition-transform", isCounselorsOpen && "rotate-90", "group-data-[collapsible=icon]:hidden")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <ul className="pl-6 py-1 space-y-1 group-data-[collapsible=icon]:hidden">
                        {counselorSubLinks.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", pathname === link.href && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}>
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible open={isAppointmentsOpen} onOpenChange={setAppointmentsOpen}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isAppointmentsActive} className="justify-between w-full" tooltip="Appointments">
                            <div className="flex items-center gap-2">
                                <CalendarRange />
                                <span>Appointments</span>
                            </div>
                            <ChevronRight className={cn("size-4 transition-transform", isAppointmentsOpen && "rotate-90", "group-data-[collapsible=icon]:hidden")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <ul className="pl-6 py-1 space-y-1 group-data-[collapsible=icon]:hidden">
                        {appointmentSubLinks.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", pathname === link.href && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}>
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CollapsibleContent>
            </Collapsible>
            
            <Collapsible open={isPromoCodesOpen} onOpenChange={setPromoCodesOpen}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isPromoCodesActive} className="justify-between w-full" tooltip="Promo Codes">
                            <div className="flex items-center gap-2">
                                <Ticket />
                                <span>Promo Codes</span>
                            </div>
                            <ChevronRight className={cn("size-4 transition-transform", isPromoCodesOpen && "rotate-90", "group-data-[collapsible=icon]:hidden")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <ul className="pl-6 py-1 space-y-1 group-data-[collapsible=icon]:hidden">
                        {promoCodeSubLinks.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", pathname === link.href && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}>
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CollapsibleContent>
            </Collapsible>

            <Collapsible open={isBlogsOpen} onOpenChange={setBlogsOpen}>
                 <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isBlogsActive} className="justify-between w-full" tooltip="Blogs">
                            <div className="flex items-center gap-2">
                                <FileText />
                                <span>Blogs</span>
                            </div>
                            <ChevronRight className={cn("size-4 transition-transform", isBlogsOpen && "rotate-90", "group-data-[collapsible=icon]:hidden")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <ul className="pl-6 py-1 space-y-1 group-data-[collapsible=icon]:hidden">
                        {blogSubLinks.map(link => (
                            <li key={link.label}>
                                <Link href={link.href} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", pathname === link.href && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}>
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenu>
    );
}
