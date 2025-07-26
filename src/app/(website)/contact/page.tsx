import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactClientPage } from './ContactClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Wellbeing Clinic in Bangladesh. Reach out via phone, email, or social media. We are here to help you on your mental health journey.',
};


export default async function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />
      <ContactClientPage />
    </>
  );
}
