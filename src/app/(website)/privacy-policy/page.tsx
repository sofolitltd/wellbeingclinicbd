import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the privacy policy for Wellbeing Clinic to understand how we collect, use, and protect your personal and health information.',
};


export default function PrivacyPolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="prose prose-lg max-w-4xl mx-auto dark:prose-invert">
          <h1 className="font-headline text-4xl font-bold tracking-wider sm:text-5xl uppercase">Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2>Introduction</h2>
          <p>
            Welcome to Wellbeing Clinic. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
            </li>
          </ul>

          <h2>Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Email you regarding your account or order.</li>
            <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
            <li>Administer sweepstakes, promotions, and contests.</li>
            <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
          </ul>

          <h2>Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:wellbeingclinicbd@gmail.com">wellbeingclinicbd@gmail.com</a>
          </p>
        </div>
      </div>
    </>
  );
}
