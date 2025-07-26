'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';

import { getColumns } from './columns';
import type { SerializableBlog } from './actions';
import { deleteBlog, deleteBlogs } from './actions';
import { useToast } from '@/hooks/use-toast';

import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function BlogsClientPage({ data }: { data: SerializableBlog[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const [blogs, setBlogs] = React.useState(data);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState({});

  const [deletingIds, setDeletingIds] = React.useState<string[]>([]);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = React.useState(false);

  const handleEdit = React.useCallback(
    (id: string) => {
      router.push(`/admin/blogs/${id}/edit`);
    },
    [router]
  );

  const handleDelete = React.useCallback((id: string) => {
    setDeletingIds([id]);
    setDeleteAlertOpen(true);
  }, []);

  const handleBulkDelete = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
    if (selectedIds.length === 0) return;
    setDeletingIds(selectedIds);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const result = deletingIds.length > 1 ? await deleteBlogs(deletingIds) : await deleteBlog(deletingIds[0]);
      if (result.success) {
        setBlogs((prev) => prev.filter((blog) => !deletingIds.includes(blog.id)));
        toast({ title: 'Blog Post(s) Deleted' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete post(s).' });
      }
      setDeleteAlertOpen(false);
      setDeletingIds([]);
      table.resetRowSelection();
    });
  };

  const columns = React.useMemo(() => getColumns(handleEdit, handleDelete), [handleEdit, handleDelete]);

  const table = useReactTable({
    data: blogs,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
  });

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by title..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
          <Button onClick={() => router.push('/admin/blogs/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>
      <DataTable table={table} columnsLength={columns.length} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {deletingIds.length > 1 ? `${deletingIds.length} blog posts` : 'the blog post'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingIds([])}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
