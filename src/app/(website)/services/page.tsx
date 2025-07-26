import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Explore the professional counseling services offered at Wellbeing Clinic, including student, individual, couple, and family therapy in Bangladesh.',
};

interface Service {
  image: string;
  dataAiHint: string;
  title: string;
  value: string;
  description: string;
  details: string[];
  price: number;
  duration: number;
}

const services: Service[] = [
  {
    image: '/services/student_counseling.jpeg',
    dataAiHint: 'student stress',
    title: 'Student Counseling',
    value: 'student-counseling',
    description: 'Specialized support for students navigating academic stress and personal growth.',
    details: [
      'Academic Stress Management',
      'Career Counseling',
      'Time Management Skills',
      'Peer Relationship Issues'
    ],
    price: 1000,
    duration: 40
  },
  {
    image: '/services/individual_counseling.jpeg',
    dataAiHint: 'individual therapy',
    title: 'Individual Counseling',
    value: 'individual-counseling',
    description: 'Confidential, one-on-one sessions tailored to your unique needs and goals.',
    details: [
        'Cognitive Behavioral Therapy (CBT)',
        'Mindfulness-Based Stress Reduction',
        'Trauma-Informed Care',
        'Personal Growth & Self-Esteem'
    ],
    price: 1200,
    duration: 45
  },
  {
    image: '/services/couple_counseling.jpeg',
    dataAiHint: 'couple therapy',
    title: 'Couple Counseling',
    value: 'couple-counseling',
    description: 'Strengthen relationships and improve communication with guided support.',
    details: [
        'Conflict Resolution',
        'Pre-marital Counseling',
        'Family Dynamics',
        'Communication Skills'
    ],
    price: 1500,
    duration: 50
  },
  
  {
    image: '/services/family_counseling.jpeg',
    dataAiHint: 'family support',
    title: 'Family Counseling',
    value: 'family-counseling',
    description: 'Collaborative sessions to improve family dynamics and resolve conflicts.',
    details: [
      'Parent-Child Relationships',
      'Conflict Resolution',
      'Blended Family Support',
      'Communication Strategies'
    ],
    price: 1800,
    duration: 60
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};


export default function ServicesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Our Services' }]} />
      <div 
        className="container mx-auto px-4 py-16 md:px-6"
      >
        <div className="space-y-12">
          <div className="text-center">
            <h1 className="font-headline text-4xl font-bold tracking-wider sm:text-5xl uppercase">Our Services</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We offer a range of professional services to support you on your mental health journey.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="h-full">
                <Card className="flex flex-col text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full">
                  <CardHeader className="items-center">
                    <div className="mb-4 relative size-40 rounded-full overflow-hidden shadow-md border-4 border-white">
                        <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover"
                            data-ai-hint={service.dataAiHint}
                        />
                    </div>
                    <CardTitle className="font-headline text-2xl mt-4 uppercase tracking-wider">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2 text-sm text-muted-foreground text-left">
                        {service.details.map(detail => (
                            <li key={detail} className="flex items-start gap-2">
                              <svg
                                className="h-4 w-4 mt-1 flex-shrink-0 text-primary"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                >
                                <path d="M20 6 9 17l-5-5" />
                                </svg>
                                <span>{detail}</span>
                            </li>
                        ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <div className="flex justify-between items-baseline mb-4 text-center">
                        <p className="font-headline text-3xl font-bold text-primary flex items-baseline justify-center gap-1">
                            <span className="text-2xl ">৳</span>
                            <span>{service.price}</span>
                            <span className="text-base font-medium text-muted-foreground">/ session</span>
                        </p>
                        <p className="font-headline text-xl font-bold text-muted-foreground"><span>
                          {service.duration}</span>
                        <span className="text-base font-medium text-muted-foreground"> min</span>


                        </p>
                    </div>
                    <Button asChild className="w-full font-bold">
                      <Link href={`/services/${service.value}`}>Book a Session</Link>
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
