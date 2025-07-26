
'use client';

import { notFound, useParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { counselors as allCounselors } from '@/data/counselors';
import { CounselorTitle } from '@/components/shared/CounselorTitle';
import { useLoading } from '@/context/LoadingProvider';

const services = [
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


export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { setLoading } = useLoading();

  const service = services.find(s => s.value === slug);

  if (!service) {
    notFound();
  }
  
  const availableCounselors = allCounselors
    .filter(c => c.services.includes(slug as any));
    
  return (
    <>
      <Breadcrumbs items={[
        { label: 'Services', href: '/services' },
        { label: service.title }
      ]} />
      <div className="container mx-auto px-4 py-16 md:px-6">
          <div className="text-center">
            <h1 className="font-headline text-3xl font-bold tracking-wider sm:text-4xl uppercase">Choose a Counselor for {service.title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Our dedicated professionals are here to support you. Select a counselor to get started.
            </p>
          </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 mx-auto">
              {availableCounselors.map((counselor) => (
                <Card key={counselor.value} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                                <AvatarImage src={counselor.image} alt={counselor.name} data-ai-hint={counselor.dataAiHint} />
                                <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-headline text-xl font-bold tracking-wider">{counselor.name}</h3>
                                <CounselorTitle title={counselor.title} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Know your expert</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">{counselor.bio}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <div className="flex justify-between items-center w-full">
                             <p className="font-headline text-2xl font-bold text-primary flex items-baseline justify-center gap-1">
                                <span className="text-xl">৳</span>
                                <span>{service.price}</span>
                                <span className="text-base font-medium text-muted-foreground">/ session</span>
                            </p>
                            <Button asChild className="font-bold rounded-full">
                                <Link href={`/appointment?service=${service.value}&counselor=${counselor.value}`} onClick={() => setLoading(true)}>Book Appointment</Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
              ))}
              {availableCounselors.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">No specific counselors listed for this service yet, but our team is ready to help.</p>
              )}
            </div>
      </div>
    </>
  );
}
