import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { BookingClientPage } from '@/app/(website)/appointment/BookingClientPage';
import type { Metadata } from 'next';
import { counselors } from '@/data/counselors';

const services = [
  { title: 'Student Counseling', value: 'student-counseling' },
  { title: 'Individual Counseling', value: 'individual-counseling' },
  { title: 'Couple Counseling', value: 'couple-counseling' },
  { title: 'Family Counseling', value: 'family-counseling' },
];

type Props = {
  params: { slug: string; counselorSlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = services.find(s => s.value === params.slug);
  const counselor = counselors.find(c => c.value === params.counselorSlug);

  if (!service || !counselor) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
    }
  }

  return {
    title: `Book ${service.title} with ${counselor.name}`,
    description: `Schedule a ${service.title.toLowerCase()} session in Bangladesh with ${counselor.name} at Wellbeing Clinic.`,
  }
}

export default function BookSpecificAppointmentPage({ params }: Props) {
    const serviceSlug = params.slug;
    const counselorSlug = params.counselorSlug;

    const service = services.find(s => s.value === serviceSlug);
    const counselor = counselors.find(c => c.value === counselorSlug);

    const breadcrumbItems = [
        { label: 'Services', href: '/services' },
        { label: service?.title || 'Service', href: `/services/${serviceSlug}` },
        { label: `Book with ${counselor?.name || 'Counselor'}` }
    ];

    return (
      <>
        <Breadcrumbs items={breadcrumbItems} />
        <BookingClientPage selectedService={serviceSlug} selectedCounselor={counselorSlug} />
      </>
  );
}
