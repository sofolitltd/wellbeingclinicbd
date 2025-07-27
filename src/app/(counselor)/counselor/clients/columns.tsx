
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SerializableAppointment } from '@/app/(admin)/admin/actions';
import { format, parse } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const getColumns = (
  onStatusUpdate: (id: string, status: 'Completed' | 'Canceled' | 'Scheduled' | 'Pending') => void
): ColumnDef<SerializableAppointment>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Client Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
   {
    accessorKey: 'service',
    header: 'Service',
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Appointment Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
        const dateStr = row.getValue("date") as string;
        try {
            if(dateStr) {
                const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
                return format(parsedDate, "PPP");
            }
        } catch (e) {
            return "Invalid Date";
        }
        return dateStr;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
     cell: ({ row }) => {
      const appointment = row.original;
      const status = appointment.status;

      const getStatusClass = () => {
        switch (status) {
            case 'Scheduled': return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-700";
            case 'Completed': return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-300 dark:border-blue-700";
            case 'Canceled': return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700";
            case 'Pending': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
            default: return "bg-muted text-muted-foreground";
        }
      }

      return (
        <Select
            value={status}
            onValueChange={(newStatus) => onStatusUpdate(appointment.id, newStatus as 'Completed' | 'Canceled' | 'Scheduled' | 'Pending')}
        >
            <SelectTrigger className={cn("capitalize w-32", getStatusClass())}>
                <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
            </SelectContent>
        </Select>
      )
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
  },
];
