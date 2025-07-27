
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Mail, ArrowUpDown, KeyRound, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SerializableCounselor } from '../../admin/counselors/actions';
import { format } from 'date-fns';

export const getColumns = (
  onSendCredentials: (counselor: SerializableCounselor) => void,
  onSendPasswordReset: (counselor: SerializableCounselor) => void,
  onDelete: (counselor: SerializableCounselor) => void
): ColumnDef<SerializableCounselor>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
       <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return <span>{format(new Date(date), 'PPP')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const counselor = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {counselor.passwordChanged ? (
                 <DropdownMenuItem onClick={() => onSendPasswordReset(counselor)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Send Password Reset
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onSendCredentials(counselor)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Credentials
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
               <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(counselor)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Counselor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
