
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
  )
}
