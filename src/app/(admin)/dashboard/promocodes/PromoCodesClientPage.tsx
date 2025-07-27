
'use client'

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { upsertPromoCode, deletePromoCode, getPromoCodes, SerializablePromoCode } from '../../admin/actions';
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { getColumns } from './columns';
import { useRouter, usePathname } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


const PromoCodeFormSchema = z.object({
    code: z.string().min(1, "Code is required.").max(50, "Code is too long.").transform(val => val.toUpperCase().replace(/\s+/g, '')),
    discountType: z.enum(['percentage', 'fixed'], { required_error: "Discount type is required." }),
    discountValue: z.coerce.number().min(0, "Discount value must be non-negative."),
    isActive: z.boolean(),
    expiresAt: z.date().optional().nullable(),
    usageLimit: z.coerce.number().min(0, "Usage limit must be a whole number.").int().optional().nullable(),
    description: z.string().optional(),
});
type PromoCodeFormData = z.infer<typeof PromoCodeFormSchema>;

export function PromoCodesClientPage({ initialData }: { initialData: SerializablePromoCode[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [isPending, startTransition] = React.useTransition();

    const [promoCodes, setPromoCodes] = React.useState(initialData);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingCode, setEditingCode] = React.useState<SerializablePromoCode | null>(null);
    const [deletingCode, setDeletingCode] = React.useState<SerializablePromoCode | null>(null);

     React.useEffect(() => {
        if (pathname === '/admin/dashboard/promocodes/new') {
            openNewModal();
        }
    }, [pathname]);

    const form = useForm<PromoCodeFormData>({
        resolver: zodResolver(PromoCodeFormSchema),
        defaultValues: {
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            isActive: true,
            expiresAt: null,
            usageLimit: null,
            description: '',
        },
    });

    const fetchCodes = React.useCallback(async () => {
        const codes = await getPromoCodes();
        setPromoCodes(codes);
    }, []);

    const handleEdit = React.useCallback((code: SerializablePromoCode) => {
        setEditingCode(code);
        form.reset({
            ...code,
            expiresAt: code.expiresAt ? new Date(code.expiresAt) : null,
            usageLimit: code.usageLimit ?? null,
        });
        setIsModalOpen(true);
    }, [form]);

    const handleDelete = React.useCallback((code: SerializablePromoCode) => {
        setDeletingCode(code);
    }, []);

    const openNewModal = () => {
        setEditingCode(null);
        form.reset({
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            isActive: true,
            expiresAt: null,
            usageLimit: null,
            description: '',
        });
        setIsModalOpen(true);
    };

     const handleModalOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open && pathname === '/admin/dashboard/promocodes/new') {
            router.push('/admin/dashboard/promocodes');
        }
    }

    const confirmDelete = () => {
        if (!deletingCode) return;
        startTransition(async () => {
            const result = await deletePromoCode(deletingCode.id);
            if (result.success) {
                await fetchCodes();
                toast({ title: "Promo Code Deleted" });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not delete promo code.' });
            }
            setDeletingCode(null);
        });
    };

    const onSubmit = (data: PromoCodeFormData) => {
        startTransition(async () => {
            const result = await upsertPromoCode(editingCode?.id || null, data);
            if (result.success) {
                await fetchCodes();
                toast({ title: editingCode ? "Promo Code Updated" : "Promo Code Created" });
                handleModalOpenChange(false);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    const columns: ColumnDef<SerializablePromoCode>[] = React.useMemo(() => getColumns(handleEdit, handleDelete), [handleEdit, handleDelete]);

    const table = useReactTable({
        data: promoCodes,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { sorting },
    });

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => router.push('/admin/dashboard/promocodes/new')}><PlusCircle className="mr-2" /> Add Promo Code</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Promo Codes</CardTitle>
                    <CardDescription>View and manage all promotional codes for your services.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable table={table} columnsLength={columns.length} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCode ? "Edit Promo Code" : "Create New Promo Code"}</DialogTitle>
                        <DialogDescription>Fill in the details for the promotional code.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Controller
                                name="code"
                                control={form.control}
                                render={({ field }) => (
                                    <Input 
                                        {...field}
                                        id="code"
                                        placeholder="e.g., SUMMER24" 
                                        onChange={(e) => {
                                            const value = e.target.value.toUpperCase().replace(/\s+/g, '');
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                            {form.formState.errors.code && <p className="text-destructive text-sm">{form.formState.errors.code.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="discountType">Discount Type</Label>
                                <Controller
                                    control={form.control}
                                    name="discountType"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discountValue">Value</Label>
                                <Input id="discountValue" type="number" {...form.register('discountValue')} placeholder="e.g., 10 or 500" min="0" />
                                {form.formState.errors.discountValue && <p className="text-destructive text-sm">{form.formState.errors.discountValue.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" {...form.register('description')} placeholder="e.g., For new year campaign" />
                        </div>
                        
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Expiration Date (Optional)</Label>
                                <Controller
                                    control={form.control}
                                    name="expiresAt"
                                    render={({ field }) => (
                                         <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} /></PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                                <Input id="usageLimit" type="number" {...form.register('usageLimit')} placeholder="e.g., 100" min="0" step="1"/>
                                {form.formState.errors.usageLimit && <p className="text-destructive text-sm">{form.formState.errors.usageLimit.message}</p>}
                            </div>
                         </div>

                        <div className="flex items-center space-x-2">
                           <Controller
                                control={form.control}
                                name="isActive"
                                render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                        
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Code'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingCode} onOpenChange={(isOpen) => !isOpen && setDeletingCode(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the promo code "{deletingCode?.code}". This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
