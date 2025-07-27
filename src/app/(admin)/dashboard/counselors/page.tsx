
import { getCounselors } from '../../admin/counselors/actions';
import { CounselorsClientPage } from './CounselorsClientPage';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function CounselorsAdminPage() {
    const counselors = await getCounselors();

    return (
        <>
            <header className="p-4 border-b flex items-center justify-between bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <h1 className="text-xl font-semibold tracking-tight">Manage Counselors</h1>
                </div>
                <Button asChild>
                    <Link href="/admin/dashboard/counselors/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Counselor
                    </Link>
                </Button>
            </header>
            <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
                 <CounselorsClientPage initialData={counselors} />
            </div>
        </>
    )
}
