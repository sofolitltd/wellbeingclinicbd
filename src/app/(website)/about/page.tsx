
'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { counselors as staff } from '@/data/counselors';
import { CounselorTitle } from '@/components/shared/CounselorTitle';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'About Us' }]} />
      <motion.div
        className="container mx-auto px-4 py-16 md:px-6"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <div className="space-y-12">
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="font-headline text-4xl font-bold tracking-wider sm:text-5xl uppercase">About Wellbeing Clinic</h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              Our commitment is to provide accessible, compassionate, and effective mental health care to everyone.
            </p>
          </motion.div>

          <motion.div className="grid gap-12 md:grid-cols-2 py-16" variants={containerVariants}>
              <motion.div className="space-y-4" variants={itemVariants}>
                  <h2 className="font-headline text-3xl font-bold tracking-wider uppercase ">Our Mission</h2>
                  <p className="text-muted-foreground">
                  To empower individuals on their journey to mental wellness by providing personalized, evidence-based care in a supportive and nurturing environment. We strive to destigmatize mental health and make quality care accessible to all.
                  </p>
              </motion.div>
              <motion.div className="space-y-4" variants={itemVariants}>
                  <h2 className="font-headline text-3xl font-bold tracking-wider uppercase">Our Values</h2>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><span className="font-semibold text-foreground">Compassion:</span> We approach every client with empathy, understanding, and kindness.</li>
                      <li><span className="font-semibold text-foreground">Integrity:</span> We uphold the highest ethical standards in all our interactions.</li>
                      <li><span className="font-semibold text-foreground">Inclusivity:</span> We celebrate diversity and provide a safe space for people of all backgrounds.</li>
                      <li><span className="font-semibold text-foreground">Collaboration:</span> We work with you as a partner in your mental health journey.</li>
                  </ul>
              </motion.div>
          </motion.div>

          <motion.div className="space-y-8" variants={containerVariants}>
            <motion.div className="text-center" variants={itemVariants}>
              <h2 className="font-headline text-3xl font-bold tracking-wider sm:text-4xl uppercase">Meet Our Team</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Our dedicated professionals are here to support you.
              </p>
            </motion.div>
            <motion.div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3" variants={containerVariants}>
              {staff.map((member) => (
                <motion.div key={member.name} variants={itemVariants}>
                  <Link href={`/team/${member.value}`} className="block h-full group">
                    <Card className="transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1 h-full">
                      <CardContent className="flex flex-col items-center pt-6 text-center">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={member.image} alt={member.name} data-ai-hint={member.dataAiHint} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-headline text-xl font-bold tracking-wider">{member.name}</h3>
                        <CounselorTitle title={member.title} />
                      
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
