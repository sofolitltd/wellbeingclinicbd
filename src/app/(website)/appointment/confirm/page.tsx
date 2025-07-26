
import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PaymentConfirmationClientPage } from './PaymentConfirmationClientPage';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getAppointmentById } from '../actions';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function ConfirmationSkeleton() {
    return (
         <Card>
            <CardHeader>
                <CardTitle>
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                </CardTitle>
                <CardDescription>
                    <Skeleton className="h-4 w-full mx-auto" />
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}


export default async function ConfirmationPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const appointmentId = searchParams.id as string | undefined;

  if (!appointmentId) {
    return (
       <div className="container mx-auto px-4 py-16 md:px-6 max-w-2xl">
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                No appointment ID was found. This page cannot be accessed directly.
            </AlertDescription>
         </Alert>
       </div>
    )
  }

  const appointment = await getAppointmentById(appointmentId);

  if (!appointment) {
     notFound();
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Book an Appointment', href: '/appointment' }, { label: 'Confirmation' }]} />
      <div className="container mx-auto px-4 py-16 md:px-6 max-w-2xl">
         <Suspense fallback={<ConfirmationSkeleton />}>
             <PaymentConfirmationClientPage appointment={appointment} />
         </Suspense>
      </div>
    </>
  );
}
