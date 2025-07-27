
'use client';

import * as React from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { format, parse } from 'date-fns';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientAuth } from '@/context/ClientAuthContext';
import { getClientAppointments, SerializableAppointment } from '../actions';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const columns: ColumnDef<SerializableAppointment>[] = [
    {
        accessorKey: 'date',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const dateStr = row.getValue("date") as string;
            try {
                const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
                return <span>{format(parsedDate, "PPP")} at {row.original.time}</span>;
            } catch (e) {
                return <span>Invalid Date</span>;
            }
        },
    },
    {
        accessorKey: 'counselor',
        header: 'Counselor',
    },
    {
        accessorKey: 'service',
        header: 'Service',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            const getStatusClass = () => {
                switch (status) {
                    case 'Scheduled': return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-700";
                    case 'Completed': return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-300 dark:border-blue-700";
                    case 'Canceled': return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700";
                    case 'Pending': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
                    default: return "bg-muted text-muted-foreground";
                }
            };
            return <Badge className={cn("capitalize", getStatusClass())}>{status}</Badge>;
        },
    },
     {
        id: 'meetLink',
        header: 'Meet Link',
        cell: ({ row }) => {
            const appointment = row.original;
            if (appointment.status === 'Scheduled' && appointment.meetLink) {
                return (
                    <Button asChild variant="secondary" size="sm">
                        <a href={appointment.meetLink} target="_blank" rel="noopener noreferrer">
                           <Video className="mr-2 h-4 w-4"/> Join Session
                        </a>
                    </Button>
                )
            }
            return null;
        }
    }
];


export default function ClientAppointmentsPage() {
    const { user } = useClientAuth();
    const { toast } = useToast();
    const [data, setData] = React.useState<SerializableAppointment[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    React.useEffect(() => {
        async function fetchAppointments() {
            if (user?.uid) {
                setIsLoading(true);
                const appointmentsData = await getClientAppointments(user.uid);
                setData(appointmentsData);
                setIsLoading(false);
            }
        }
        fetchAppointments();
    }, [user, toast]);
    
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    });

    return (
        <>
            <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold tracking-tight">My Appointments</h1>
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
    )
}
