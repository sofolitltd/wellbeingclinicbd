
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { SerializablePromoCode } from '../actions';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const getColumns = (
  onEdit: (code: SerializablePromoCode) => void,
  onDelete: (code: SerializablePromoCode) => void
): ColumnDef<SerializablePromoCode>[] => [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono font-medium">{row.original.code}</div>,
  },
  {
    accessorKey: 'discountValue',
    header: 'Discount',
    cell: ({ row }) => {
      const code = row.original;
      return code.discountType === 'percentage'
        ? `${code.discountValue}%`
        : `৳${code.discountValue}`;
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const code = row.original;
      return <Badge variant={code.isActive ? 'secondary' : 'outline'}>{code.isActive ? 'Active' : 'Inactive'}</Badge>;
    },
  },
  {
    accessorKey: 'usageLimit',
    header: 'Usage',
    cell: ({ row }) => {
      const code = row.original;
      return `${code.timesUsed} / ${code.usageLimit ?? '∞'}`;
    },
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires At',
    cell: ({ row }) => {
      const expiresAt = row.original.expiresAt;
      return expiresAt ? format(new Date(expiresAt), 'PPP') : 'Never';
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'PPP'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const code = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(code)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(code)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
