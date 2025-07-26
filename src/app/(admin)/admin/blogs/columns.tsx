
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import type { SerializableBlog } from './actions';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

export const getColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<SerializableBlog>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const blog = row.original;
      return (
        <div className="flex items-center gap-4">
            <Image
                src={blog.image}
                alt={blog.title}
                width={40}
                height={40}
                className="rounded-md object-cover"
            />
            <Link 
                href={`/blogs/${blog.slug}`} 
                target="_blank" 
                className="font-medium hover:underline"
                title="View live post"
            >
                {blog.title}
            </Link>
        </div>
      )
    },
  },
  {
    accessorKey: 'categories',
    header: 'Categories',
    cell: ({ row }) => {
        const categories = row.getValue('categories') as string[];
        if (!categories || categories.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-1">
                {categories.map(cat => <Badge key={cat} variant="outline">{cat}</Badge>)}
            </div>
        )
    }
  },
  {
    accessorKey: 'isPublished',
    header: 'Status',
    cell: ({ row }) => {
      const isPublished = row.getValue('isPublished');
      return (
        <Badge variant={isPublished ? 'secondary' : 'outline'}>
          {isPublished ? 'Published' : 'Draft'}
        </Badge>
      );
    },
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
      const blog = row.original;

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
              <DropdownMenuItem onClick={() => onEdit(blog.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(blog.id)}
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
