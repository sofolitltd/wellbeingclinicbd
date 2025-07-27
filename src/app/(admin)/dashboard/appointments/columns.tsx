
"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import type { SerializableAppointment } from "../../admin/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, parse } from "date-fns"

export const getColumns = (
    onEdit: (appointment: SerializableAppointment) => void,
    onDelete: (id: string) => void,
    onStatusUpdate: (id: string, status: 'Scheduled' | 'Completed' | 'Canceled' | 'Pending', appointment: SerializableAppointment) => void,
    onDetails: (appointment: SerializableAppointment) => void
): ColumnDef<SerializableAppointment>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
   {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "counselor",
    header: "Counselor",
  },
  {
    accessorKey: "date",
    header: "Appointment Date",
    cell: ({ row }) => {
        const dateStr = row.getValue("date") as string;
        const [formattedDate, setFormattedDate] = React.useState(dateStr);
    
        React.useEffect(() => {
            try {
                if(dateStr) {
                    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
                    setFormattedDate(format(parsedDate, "PPP"));
                }
            } catch (e) {
                setFormattedDate("Invalid Date");
            }
        }, [dateStr]);
    
        return <span>{formattedDate}</span>;
    }
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "status",
    header: "Status",
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
            onValueChange={(newStatus) => onStatusUpdate(appointment.id, newStatus as 'Completed' | 'Canceled' | 'Scheduled' | 'Pending', appointment)}
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
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original

      return (
         <div className="flex items-center justify-end gap-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onDetails(appointment)}>
                            <span className="sr-only">View Details</span>
                            <Info className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View Details</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(appointment)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => onDelete(appointment.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    },
  },
]
