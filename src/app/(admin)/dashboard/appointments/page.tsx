
import { getAppointments } from '../../admin/actions';
import { AppointmentsClientPage } from './AppointmentsClientPage';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const revalidate = 0; // Ensure dynamic rendering

export default async function AppointmentsAdminPage() {
    // Initial data fetch for faster page load, will be updated by real-time listener on client
    const appointments = await getAppointments();

    return (
        <>
            <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold tracking-tight">Manage Appointments</h1>
            </header>
            <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
                 <AppointmentsClientPage initialData={appointments} />
            </div>
        </>
    )
}
