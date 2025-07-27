
"use client"

import * as React from "react"
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import type { SerializableAppointment, Appointment } from "../../admin/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";
import { deleteAppointment, deleteAppointments, updateAppointmentStatus, updateAppointment } from "../../admin/actions";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { counselors as allCounselors } from "@/data/counselors";


const availableServices = [
    { value: 'Student Counseling', label: 'Student Counseling' },
    { value: 'Individual Counseling', label: 'Individual Counseling' },
    { value: 'Couple Counseling', label: 'Couple Counseling' },
    { value: 'Family Counseling', label: 'Family Counseling' },
];

export function AppointmentsClientPage({ initialData }: { initialData: SerializableAppointment[] }) {
    const { toast } = useToast();
    const [isPending, startTransition] = React.useTransition();

    const [appointments, setAppointments] = React.useState(initialData);
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [rowSelection, setRowSelection] = React.useState({})

    const [editingAppointment, setEditingAppointment] = React.useState<SerializableAppointment | null>(null);
    const [viewingAppointment, setViewingAppointment] = React.useState<SerializableAppointment | null>(null);
    
    const [deletingIds, setDeletingIds] = React.useState<string[]>([]);
    const [isDeleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
    
    // Form state for edit modal
    const [editedDate, setEditedDate] = React.useState<Date | undefined>();
    const [editedTime, setEditedTime] = React.useState('');
    const [editedService, setEditedService] = React.useState('');
    const [editedCounselor, setEditedCounselor] = React.useState('');
    const [editedPrice, setEditedPrice] = React.useState('');

     React.useEffect(() => {
        const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const realtimeAppointments: SerializableAppointment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as Appointment;
                const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
                realtimeAppointments.push({
                    id: doc.id,
                    ...data,
                    createdAt,
                });
            });
            setAppointments(realtimeAppointments);
        }, (error) => {
            console.error("Error fetching realtime appointments: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load appointments in real-time.' });
        });

        return () => unsubscribe();
    }, [toast]);
    
    const availableCounselorsForEdit = React.useMemo(() => {
        if (!editedService) return [];
        const serviceData = availableServices.find(s => s.label === editedService);
        const serviceValue = serviceData?.label.toLowerCase().replace(/\s/g, '-') || '';
        if (!serviceValue) return [];
        return allCounselors.filter(c => c.services.includes(serviceValue as any));
    }, [editedService]);

    const availableTimesForEdit = React.useMemo(() => {
        if (!editedCounselor) return [];
        const counselorData = allCounselors.find(c => c.value === editedCounselor);
        return counselorData?.times || [];
    }, [editedCounselor]);

    React.useEffect(() => {
      if (editingAppointment) {
          const parsedDate = new Date(editingAppointment.date);
          setEditedDate(isNaN(parsedDate.getTime()) ? undefined : parsedDate);
          setEditedTime(editingAppointment.time);
          setEditedService(editingAppointment.service);
          setEditedCounselor(editingAppointment.counselorId || '');
          setEditedPrice(editingAppointment.totalPrice || '');
      }
    }, [editingAppointment]);

    React.useEffect(() => {
        if (editedService && !availableCounselorsForEdit.some(c => c.value === editedCounselor)) {
            setEditedCounselor('');
        }
    }, [editedService, editedCounselor, availableCounselorsForEdit]);
    
    React.useEffect(() => {
        if (editedCounselor && !availableTimesForEdit.includes(editedTime as any)) {
            setEditedTime('');
        }
    }, [editedCounselor, editedTime, availableTimesForEdit]);
    
    const handleEdit = React.useCallback((appointment: SerializableAppointment) => {
        setEditingAppointment(appointment);
    }, []);

    const handleDelete = React.useCallback((id: string) => {
        setDeletingIds([id]);
        setDeleteAlertOpen(true);
    }, []);

    const handleBulkDelete = () => {
        const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
        if(selectedIds.length === 0) return;
        setDeletingIds(selectedIds);
        setDeleteAlertOpen(true);
    }
    
    const handleStatusUpdate = React.useCallback((id: string, status: 'Completed' | 'Canceled' | 'Scheduled' | 'Pending', currentApt: SerializableAppointment) => {
        startTransition(async () => {
            let price: number | undefined = parseFloat(currentApt.totalPrice);
    
            if (currentApt.status === 'Pending' && status === 'Scheduled') {
                if (price <= 0) {
                     toast({ variant: 'destructive', title: 'Invalid Price', description: 'Price must be greater than 0 to schedule this appointment. Please edit the appointment to set a price.' });
                    return;
                }
            }

            const result = await updateAppointmentStatus(id, status, price);
            if (result.success) {
                // Real-time listener will update the state
                toast({ title: `Appointment marked as ${status}` });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not update appointment status.' });
            }
        });
    }, [toast]);
    
    const handleViewDetails = React.useCallback((appointment: SerializableAppointment) => {
        setViewingAppointment(appointment);
    }, []);

    const confirmDelete = () => {
        startTransition(async () => {
            const result = deletingIds.length > 1 ? await deleteAppointments(deletingIds) : await deleteAppointment(deletingIds[0]);
            if (result.success) {
                // Real-time listener will update state
                toast({ title: "Appointment(s) Deleted" });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not delete appointment(s).' });
            }
            setDeleteAlertOpen(false);
            setDeletingIds([]);
            table.resetRowSelection();
        });
    }

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAppointment || !editedDate || !editedTime || !editedService || !editedCounselor) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please ensure all fields are valid.' });
            return;
        }

        startTransition(async () => {
            const updatedData = {
                date: format(editedDate, "yyyy-MM-dd"),
                time: editedTime,
                service: editedService,
                counselor: editedCounselor,
                totalPrice: editedPrice,
            };
            const result = await updateAppointment(editingAppointment.id, updatedData);

            if (result.success) {
                toast({ title: "Appointment Updated" });
                setEditingAppointment(null);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not update appointment.' });
            }
        });
    }

    const columns = React.useMemo(() => getColumns(handleEdit, handleDelete, handleStatusUpdate, handleViewDetails), [handleEdit, handleDelete, handleStatusUpdate, handleViewDetails]);

    const table = useReactTable({
        data: appointments,
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
                    placeholder="Filter by name or phone..."
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <Button variant="destructive" onClick={handleBulkDelete} disabled={isPending}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete ({table.getFilteredSelectedRowModel().rows.length})
                    </Button>
                )}
            </div>
            <DataTable table={table} columnsLength={columns.length} />

            {/* View Details Modal */}
            <Dialog open={!!viewingAppointment} onOpenChange={(isOpen) => !isOpen && setViewingAppointment(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Appointment Details</DialogTitle>
                        <DialogDescription>
                            Full details for the appointment booked by {viewingAppointment?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    {viewingAppointment && (
                         <div className="space-y-3 py-4 text-sm">
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Client Name:</span><span>{viewingAppointment.name}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Email:</span><span>{viewingAppointment.email}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Phone:</span><span>{viewingAppointment.phone}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Gender:</span><span>{viewingAppointment.gender || 'N/A'}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Service:</span><span>{viewingAppointment.service}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Counselor:</span><span>{viewingAppointment.counselor}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Date:</span><span>{format(new Date(viewingAppointment.date), "PPP")}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Time:</span><span>{viewingAppointment.time}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Status:</span><span>{viewingAppointment.status}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Payment Method:</span><span>{viewingAppointment.paymentMethod || 'bKash'}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Payment Mobile:</span><span>{viewingAppointment.paymentMobileNo || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Trx ID:</span><span>{viewingAppointment.trxID || 'N/A'}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Total Price:</span><span className="font-bold">৳{viewingAppointment.totalPrice}</span></div>
                             <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Added By:</span><span>{viewingAppointment.addedBy}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-muted-foreground">Booked On:</span><span>{format(new Date(viewingAppointment.createdAt), "PPp")}</span></div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!editingAppointment} onOpenChange={(isOpen) => !isOpen && setEditingAppointment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Appointment</DialogTitle>
                        <DialogDescription>Update the details for the appointment. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSubmit}>
                        <div className="grid gap-4 py-4">
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="service" className="text-right">Service</Label>
                                <Select value={editedService} onValueChange={setEditedService}>
                                    <SelectTrigger id="service" className="col-span-3"><SelectValue placeholder="Select a service" /></SelectTrigger>
                                    <SelectContent>
                                        {availableServices.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="counselor" className="text-right">Counselor</Label>
                                <Select value={editedCounselor} onValueChange={setEditedCounselor} disabled={!editedService}>
                                    <SelectTrigger id="counselor" className="col-span-3"><SelectValue placeholder="Select a counselor" /></SelectTrigger>
                                    <SelectContent>
                                        {availableCounselorsForEdit.map((c) => (<SelectItem key={c.value} value={c.value}>{c.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal col-span-3", !editedDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editedDate ? format(editedDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editedDate} onSelect={setEditedDate} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="time" className="text-right">Time</Label>
                                <Select value={editedTime} onValueChange={setEditedTime} disabled={!editedCounselor}>
                                    <SelectTrigger id="time" className="col-span-3"><SelectValue placeholder="Select a time" /></SelectTrigger>
                                    <SelectContent>
                                        {availableTimesForEdit.map((t) => (<SelectItem key={t as string} value={t as string}>{t}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Price</Label>
                                <Input id="price" value={editedPrice} onChange={(e) => setEditedPrice(e.target.value)} className="col-span-3" type="number" placeholder="Enter amount" min="0"/>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete {deletingIds.length > 1 ? `${deletingIds.length} appointments` : 'the appointment'}.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingIds([])}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
