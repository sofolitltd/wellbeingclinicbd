
'use client';

import * as React from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

import type { SerializableCounselor } from '../../admin/counselors/actions';
import { sendPasswordResetEmail, deleteCounselor, getCounselors, sendCredentialsEmail } from '../../admin/counselors/actions';
import { getColumns } from './columns';
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
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CounselorsClientPage({ initialData }: { initialData: SerializableCounselor[] }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [counselors, setCounselors] = React.useState(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [credentialCounselor, setCredentialCounselor] = React.useState<SerializableCounselor | null>(null);
  const [tempPassword, setTempPassword] = React.useState('');
  const [resettingCounselor, setResettingCounselor] = React.useState<SerializableCounselor | null>(null);
  const [deletingCounselor, setDeletingCounselor] = React.useState<SerializableCounselor | null>(null);

  React.useEffect(() => {
    if (credentialCounselor) {
      setTempPassword(credentialCounselor.tempPassword || '');
    }
  }, [credentialCounselor]);

  const handleSendCredentials = React.useCallback((counselor: SerializableCounselor) => {
    setCredentialCounselor(counselor);
  }, []);

  const handleSendPasswordReset = React.useCallback((counselor: SerializableCounselor) => {
    setResettingCounselor(counselor);
  }, []);
  
  const handleDelete = React.useCallback((counselor: SerializableCounselor) => {
    setDeletingCounselor(counselor);
  }, []);

  const fetchCounselors = React.useCallback(async () => {
    const freshData = await getCounselors();
    setCounselors(freshData);
  }, []);

  const confirmSendCredentials = () => {
    if (!credentialCounselor || !tempPassword) return;
    startTransition(async () => {
        const result = await sendCredentialsEmail(credentialCounselor.email, tempPassword);
        if (result.success) {
            toast({ title: 'Credentials Sent', description: `An email has been sent to ${credentialCounselor.email}.` });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not send credentials email.' });
        }
        setCredentialCounselor(null);
        setTempPassword('');
    });
  };

  const confirmSendReset = () => {
    if (!resettingCounselor) return;
    startTransition(async () => {
      const result = await sendPasswordResetEmail(resettingCounselor.email);
      if (result.success) {
        toast({ title: 'Password Reset Sent', description: `An email has been sent to ${resettingCounselor.email}.` });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not send reset email.' });
      }
      setResettingCounselor(null);
    });
  };
  
  const confirmDelete = () => {
    if (!deletingCounselor) return;
    startTransition(async () => {
      const result = await deleteCounselor(deletingCounselor.uid);
      if (result.success) {
        toast({ title: 'Counselor Deleted' });
        await fetchCounselors();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not delete counselor.' });
      }
      setDeletingCounselor(null);
    });
  };

  const columns = React.useMemo(() => getColumns(handleSendCredentials, handleSendPasswordReset, handleDelete), [handleSendCredentials, handleSendPasswordReset, handleDelete]);

  const table = useReactTable({
    data: counselors,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { 
      sorting,
      rowSelection,
     },
  });

  return (
    <>
      <DataTable table={table} columnsLength={columns.length} />

      <Dialog open={!!credentialCounselor} onOpenChange={(isOpen) => !isOpen && setCredentialCounselor(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Send Temporary Password</DialogTitle>
                  <DialogDescription>
                      This will email the temporary password to <strong>{credentialCounselor?.email}</strong>. Click send to confirm.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="temp-pass" className="text-right">Password</Label>
                      <Input id="temp-pass" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} className="col-span-3" disabled />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                  <Button onClick={confirmSendCredentials} disabled={isPending || !tempPassword}>
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Email'}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <AlertDialog open={!!resettingCounselor} onOpenChange={(isOpen) => !isOpen && setResettingCounselor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send a password reset link to <strong>{resettingCounselor?.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendReset} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Email'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingCounselor} onOpenChange={(isOpen) => !isOpen && setDeletingCounselor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for <strong>{deletingCounselor?.name}</strong> and remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete Counselor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
