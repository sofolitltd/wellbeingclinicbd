import { AppCtaSection } from "@/components/home/AppCtaSection";
import { BlogSection } from "@/components/home/BlogSection";
import { HeroSection } from "@/components/home/HeroSection";
import { ContactSection } from "@/components/home/ContactSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Wellbeing Clinic | Mental Health Counseling in Bangladesh',
  },
  description: 'Wellbeing Clinic offers professional mental health services in Bangladesh. Get compassionate counseling for students, individuals, couples, and families to support your mental wellness journey.',
};



export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <AppCtaSection />
      <BlogSection />
      <ContactSection />
    </div>
  );
}
