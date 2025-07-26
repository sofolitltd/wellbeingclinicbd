'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useLoading } from '@/context/LoadingProvider';

const services = [
    {
      image: '/services/student_counseling.jpeg',
      dataAiHint: 'student stress',
      title: 'Student Counseling',
      value: 'student-counseling',
      description: 'Specialized support for students navigating academic stress and personal growth.',
       
    },
    {
      image: '/services/individual_counseling.jpeg',
      dataAiHint: 'individual therapy',
      title: 'Individual Counseling',
      value: 'individual-counseling',
      description: 'Confidential, one-on-one sessions tailored to your unique needs and goals.',
       
    },
    {
      image: '/services/couple_counseling.jpeg',
      dataAiHint: 'couple therapy',
      title: 'Couple Counseling',
      value: 'couple-counseling',
      description: 'Strengthen relationships and improve communication with guided support.',
    
    },
    {
      image: '/services/family_counseling.jpeg',
      dataAiHint: 'family support',
      title: 'Family Counseling',
      value: 'family-counseling',
      description: 'Collaborative sessions to improve family dynamics and resolve conflicts.',
      
    },
  ];

const sectionVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

export function ServicesSection() {
    const { setLoading } = useLoading();
    return (
        <motion.section 
            className="w-full py-16 md:py-24"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={sectionVariants}
        >
            <div className="container mx-auto px-4 md:px-6">
                <motion.div 
                    className="text-center max-w-2xl mx-auto mb-12"
                    variants={itemVariants}
                >
                    <h2 className="font-headline text-3xl font-semibold tracking-wider sm:text-4xl uppercase">Our Services</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">
                    We offer a range of professional services to support you on your mental health journey.
                    </p>
                </motion.div>
                <motion.div 
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
                    variants={sectionVariants}
                >
                    {services.map((service) => (
                        <motion.div key={service.title} className="h-full" variants={itemVariants}>
                            <Link href={`/services/${service.value}`} onClick={() => setLoading(true)} className="text-center flex flex-col items-center p-6 rounded-xl transition-all duration-300 hover:bg-card hover:shadow-2xl hover:-translate-y-2 group h-full">
                                <div className="mb-4 relative size-40 rounded-full overflow-hidden shadow-md border-4 border-white">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={service.dataAiHint}
                                    />
                                </div>
                                <h3 className="font-headline text-2xl font-bold uppercase tracking-wider">{service.title}</h3>
                                <p className="mt-2 text-base text-muted-foreground">{service.description}</p>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
                <motion.div 
                    className="text-center mt-12"
                    variants={itemVariants}
                >
                    <Button asChild size="lg" className="font-bold transition-transform duration-300 hover:scale-105">
                        <Link href="/services" onClick={() => setLoading(true)}>Explore All Services</Link>
                    </Button>
                </motion.div>
            </div>
        </motion.section>
    );
}
