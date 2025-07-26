import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Review the terms and conditions for using the Wellbeing Clinic website and services. Understand your rights and responsibilities as a user.',
};


export default function TermsAndConditionsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="prose prose-lg max-w-4xl mx-auto dark:prose-invert">
          <h1 className="font-headline text-4xl font-bold tracking-wider sm:text-5xl uppercase">Terms and Conditions</h1>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By using our website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
          </p>

          <h2>2. Services</h2>
          <p>
            Wellbeing Clinic provides mental health counseling and related services. Our services are not a substitute for medical advice or treatment. We do not provide emergency services. If you are in crisis, please contact your local emergency services immediately.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features of our website, you may need to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
          </p>

          <h2>4. Payments and Cancellations</h2>
          <p>
            Fees for our services are detailed on our website. Payments are due at the time of booking. We have a cancellation policy that will be provided to you when you book an appointment.
          </p>
          
          <h2>5. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and images, is the property of Wellbeing Clinic or its content suppliers and is protected by intellectual property laws.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            Wellbeing Clinic will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.
          </p>
          
          <h2>7. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms and Conditions on this page.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at: <a href="mailto:wellbeingclinicbd@gmail.com">wellbeingclinicbd@gmail.com</a>
          </p>
        </div>
      </div>
    </>
  );
}
