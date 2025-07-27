
'use client';

import * as React from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import type { SerializableAppointment } from '@/app/(admin)/admin/actions';
import { getCounselorClients } from '../actions';
import { updateAppointmentStatus } from '@/app/(admin)/admin/actions';
import { getColumns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { useCounselorAuth } from '@/context/CounselorAuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function CounselorClientsPage() {
  const { user } = useCounselorAuth();
  const { toast } = useToast();
  const [data, setData] = React.useState<SerializableAppointment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isUpdating, startUpdateTransition] = React.useTransition();

  const fetchClients = React.useCallback(async () => {
      if (user?.uid) {
        setIsLoading(true);
        const clientsData = await getCounselorClients(user.uid);
        setData(clientsData);
        setIsLoading(false);
      }
    }, [user]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleStatusUpdate = React.useCallback(
    (id: string, status: 'Completed' | 'Canceled' | 'Scheduled' | 'Pending') => {
      startUpdateTransition(async () => {
        const result = await updateAppointmentStatus(id, status);
        if (result.success) {
          toast({ title: `Appointment marked as ${status}` });
          // Re-fetch data to show the change
          await fetchClients();
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error || 'Could not update appointment status.',
          });
        }
      });
    },
    [toast, fetchClients]
  );


  const columns = React.useMemo(() => getColumns(handleStatusUpdate), [handleStatusUpdate]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { 
      sorting,
    },
  });

  return (
    <>
      <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold tracking-tight">My Clients</h1>
      </header>
      <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <DataTable table={table} columnsLength={columns.length} />
        )}
      </div>
    </>
  );
}
