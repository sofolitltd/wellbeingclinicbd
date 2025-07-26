
import { getAppointmentByShortId } from '@/app/(website)/appointment/actions';
import { notFound } from 'next/navigation';
import { SessionClientPage } from './SessionClientPage';
import type { Metadata } from 'next';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const appointment = await getAppointmentByShortId(params.id);
  if (!appointment) {
    return {
      title: "Appointment Not Found - Wellbeing Clinic",
      description: "The appointment you are looking for does not exist.",
    }
  }

  return {
    title: `Your ${appointment.service} Session - Wellbeing Clinic`,
    description: `Details for your upcoming counseling session with ${appointment.counselor} at Wellbeing Clinic.`,
    // Prevent search engines from indexing these private pages
    robots: {
        index: false,
        follow: false,
    }
  }
}


export default async function SessionPage({ params }: { params: { id: string }}) {
    const appointment = await getAppointmentByShortId(params.id);

    if (!appointment) {
        notFound();
    }
    
    return (
        <div className="container mx-auto px-4 py-16 md:px-6 max-w-2xl">
            <SessionClientPage appointment={appointment} />
        </div>
    );
}
