
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import Image from 'next/image';
import { AdminNav } from './AdminNav';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const Logo = () => (
    <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
      <Image
        src="/wb_logo.png"
        alt="wellbeing Clinic Logo"
        width={36}
        height={36}
        className=""
        data-ai-hint="wellbeing Clinic Logo"
      />
      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
        <span className="font-headline text-xl font-bold uppercase tracking-wider text-foreground">
          Wellbeing Clinic
        </span>
        <span className="text-[13px] text-muted-foreground -mt-1 ">
          Admin
        </span>
      </div>
    </div>
  );

function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we are not loading and there is no user, redirect to login
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  // If we are on the login page, we don't need the protected layout.
  // The page itself will handle redirecting if the user is already logged in.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // While loading or if there's no user, show a loading spinner.
  // This prevents content flashing for unauthenticated users.
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the user is authenticated, render the full admin dashboard layout.
  return (
    <div className="bg-muted/40">
        <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
                <Link href="/admin" className="flex items-center justify-center">
                    <Logo />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <AdminNav />
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            {children}
        </SidebarInset>
        </SidebarProvider>
    </div>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <ProtectedAdminLayout>{children}</ProtectedAdminLayout>
    </AdminAuthProvider>
  )
}
