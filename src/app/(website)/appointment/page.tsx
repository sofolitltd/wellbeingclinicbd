import { Breadcrumbs, type BreadcrumbItem } from '@/components/layout/Breadcrumbs';
import { BookingClientPage } from './BookingClientPage';
import type { Metadata } from 'next';
import { counselors, services as allServices } from '@/data/counselors';

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Schedule your counseling session with a professional therapist at Wellbeing Clinic. Choose your service, counselor, and preferred time in Bangladesh.',
};


export default function BookingPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const serviceSlug = searchParams.service as string | undefined;
    const counselorSlug = searchParams.counselor as string | undefined;
    const fromTeam = searchParams.from === 'team';

    const breadcrumbItems: BreadcrumbItem[] = [];
    const service = allServices.find(s => s.value === serviceSlug);
    const counselor = counselors.find(c => c.value === counselorSlug);

    if (fromTeam && counselor) {
        breadcrumbItems.push({ label: 'About Us', href: '/about' });
        breadcrumbItems.push({ label: counselor.name, href: `/team/${counselor.value}` });
        breadcrumbItems.push({ label: 'Book Appointment' });
    } else if (service) {
        breadcrumbItems.push({ label: 'Services', href: '/services' });
        breadcrumbItems.push({ label: service.title, href: `/services/${service.value}` });
        if (counselor) {
            breadcrumbItems.push({ label: `Book with ${counselor.name}` });
        } else {
             breadcrumbItems.push({ label: 'Choose Counselor' });
        }
    } else {
        breadcrumbItems.push({ label: 'Book an Appointment' });
    }

    return (
      <>
        <Breadcrumbs items={breadcrumbItems} />
        <BookingClientPage selectedService={serviceSlug} selectedCounselor={counselorSlug} />
      </>
  );
}
