
'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';

import { getColumns } from './columns';
import type { CategoryWithPostCount } from '../actions';
import { addCategory, deleteCategory, updateCategory } from '../actions';
import { useToast } from '@/hooks/use-toast';

import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function CategoriesClientPage({ data }: { data: CategoryWithPostCount[] }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const [categories, setCategories] = React.useState(data);
  const [sorting, setSorting] = React.useState<SortingState>([ { id: 'postCount', desc: true } ]);

  const [deletingCategory, setDeletingCategory] = React.useState<CategoryWithPostCount | null>(null);
  const [editingCategory, setEditingCategory] = React.useState<CategoryWithPostCount | null>(null);
  const [editedName, setEditedName] = React.useState('');
  const [newCategoryName, setNewCategoryName] = React.useState('');

  React.useEffect(() => {
    if (editingCategory) {
      setEditedName(editingCategory.name);
    }
  }, [editingCategory]);

  const handleEdit = React.useCallback((category: CategoryWithPostCount) => {
    setEditingCategory(category);
  }, []);

  const handleDelete = React.useCallback((category: CategoryWithPostCount) => {
    setDeletingCategory(category);
  }, []);

  const confirmDelete = () => {
    if (!deletingCategory) return;
    startTransition(async () => {
      const result = await deleteCategory(deletingCategory.id);
      if (result.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== deletingCategory.id));
        toast({ title: 'Category Deleted' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not delete category.' });
      }
      setDeletingCategory(null);
    });
  };
  
  const handleAddCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newCategoryName.trim() === "") return;
      startTransition(async () => {
          const result = await addCategory(newCategoryName);
          if (result.success && result.category) {
              setCategories(prev => [...prev, { ...result.category!, postCount: 0 }].sort((a,b) => a.name.localeCompare(b.name)));
              setNewCategoryName("");
              toast({ title: "Category added" });
          } else {
              toast({ variant: 'destructive', title: "Error", description: result.error });
          }
      });
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || editedName.trim() === "") {
        toast({ variant: 'destructive', title: 'Error', description: 'Please provide a valid category name.' });
        return;
    }

    startTransition(async () => {
        const result = await updateCategory(editingCategory.id, editedName);
        if (result.success) {
            setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? { ...cat, name: editedName } : cat));
            toast({ title: "Category Updated" });
            setEditingCategory(null);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not update category.' });
        }
    });
  };

  const columns = React.useMemo(() => getColumns(handleEdit, handleDelete), [handleEdit, handleDelete]);

  const table = useReactTable({
    data: categories,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>All Categories</CardTitle>
                <CardDescription>View and manage all your blog post categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable table={table} columnsLength={columns.length} />
            </CardContent>
        </Card>
      </div>
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Add New Category</CardTitle>
                <CardDescription>Create a new category for your blog posts.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newCategory">Category Name</Label>
                        <Input id="newCategory" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Mindfulness"/>
                    </div>
                    <Button type="submit" disabled={isPending || newCategoryName.trim() === ''}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        Add Category
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingCategory} onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category name. This will also update it on all associated posts.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(isOpen) => !isOpen && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category "{deletingCategory?.name}" and remove it from all associated blog posts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
