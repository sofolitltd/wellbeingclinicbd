
import { getPromoCodes } from '../actions';
import { PromoCodesClientPage } from './PromoCodesClientPage';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const revalidate = 0; // Ensure dynamic rendering

export default async function PromoCodesAdminPage() {
    const codes = await getPromoCodes();

    return (
        <>
            <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold tracking-tight">Manage Promo Codes</h1>
            </header>
            <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
                 <PromoCodesClientPage initialData={codes} />
            </div>
        </>
    )
}
