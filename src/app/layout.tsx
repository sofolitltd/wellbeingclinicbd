import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DM_Sans, Barlow_Condensed } from 'next/font/google';
import { cn } from '@/lib/utils';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  variable: '--font-barlow-condensed',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Wellbeing Clinic',
    default: 'Wellbeing Clinic - Your Partner in Mental Wellness',
  },
  description: 'Your partner in mental wellness. We offer professional counseling and therapy services in Bangladesh to support your journey to a healthier mind.',
  keywords: ['mental health', 'therapy', 'counseling', 'wellbeing', 'psychology', 'dhaka', 'bangladesh'],
  authors: [{ name: 'Wellbeing Clinic' }],
  openGraph: {
    title: 'Wellbeing Clinic - Your Partner in Mental Wellness',
    description: 'Professional and compassionate counseling services in Bangladesh. We offer student, individual, couple, and family therapy to support your mental health journey.',
    url: 'https://wellbeingclinic.vercel.app',
    siteName: 'Wellbeing Clinic',
    images: [
      {
        url: 'https://wellbeingclinic.vercel.app/og-image.png', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: 'Wellbeing Clinic - Your Partner in Mental Wellness',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wellbeing Clinic - Your Partner in Mental Wellness',
    description: 'Professional and compassionate counseling services in Bangladesh to support your mental health journey.',
    // images: ['https://wellbeingclinic.vercel.app/twitter-image.png'], // Replace with your actual Twitter image URL
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <meta name="google-site-verification" content="Evx4-_A8qr7gV3b3Kv7-JRn4xjAXaoNXNC2aG2sOjxs" />
        <link rel="icon" href="/wb_logo.png" sizes="any" />
      </head>
      <body className={cn("h-full font-body antialiased", dmSans.variable, barlowCondensed.variable)}>
          {children}
          <Toaster />
      </body>
    </html>
  );
}
