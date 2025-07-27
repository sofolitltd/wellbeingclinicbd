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
import { CounselorNav } from '../CounselorNav';
import { CounselorAuthProvider, useCounselorAuth } from '@/context/CounselorAuthContext';
import { useRouter } from 'next/navigation';
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
          Counselor Dashboard
        </span>
      </div>
    </div>
  );

function ProtectedCounselorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCounselorAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/counselor/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
     <div className="bg-muted/40">
        <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
                <Link href="/counselor/dashboard" className="flex items-center justify-center">
                    <Logo />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <CounselorNav />
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            {children}
        </SidebarInset>
        </SidebarProvider>
    </div>
  );
}


export default function CounselorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CounselorAuthProvider>
      <ProtectedCounselorLayout>{children}</ProtectedCounselorLayout>
    </CounselorAuthProvider>
  )
}
