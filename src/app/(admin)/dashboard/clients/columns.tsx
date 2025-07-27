
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SerializableClient } from '../../admin/actions'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export const getColumns = (): ColumnDef<SerializableClient>[] => [
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        First Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: row => `${row.firstName} ${row.lastName}`,
    cell: ({ row }) => {
        const client = row.original
        return <div>{client.firstName} {client.lastName}</div>
    }
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
    accessorKey: 'mobile',
    header: 'Mobile',
  },
   {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => {
        const gender = row.original.gender;
        return <Badge variant="outline" className="capitalize">{gender}</Badge>
    }
  },
  {
    accessorKey: 'dob',
    header: 'Date of Birth',
     cell: ({ row }) => {
      const date = row.getValue('dob') as string;
      return <span>{format(new Date(date), 'PPP')}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined At',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return <span>{format(new Date(date), 'PPP')}</span>;
    },
  },
]
