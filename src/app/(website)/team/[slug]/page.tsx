
'use client';

import { notFound, useParams } from 'next/navigation';
import { counselors, services as allServices } from '@/data/counselors';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Linkedin, Facebook, Briefcase, GraduationCap, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useLoading } from '@/context/LoadingProvider';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function TeamMemberPage() {
  const params = useParams();
  const { setLoading } = useLoading();
  const [selectedService, setSelectedService] = useState('');
  const member = counselors.find(c => c.value === params.slug);

  if (!member) {
    notFound();
  }

  const socialLinks = Object.entries(member.social || {}).map(([key, value]) => {
      let icon = <LinkIcon className="h-4 w-4" />;
      if (key === 'linkedin') icon = <Linkedin className="h-4 w-4" />;
      if (key === 'facebook') icon = <Facebook className="h-4 w-4" />;
      return { platform: key, href: value, icon };
  });

  const memberServices = member.services.map(serviceSlug => {
      return allServices.find(s => s.value === serviceSlug);
  }).filter(Boolean);


  return (
    <>
      <Breadcrumbs items={[
        { label: 'About Us', href: '/about' },
        { label: member.name }
      ]} />
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left Column (Sticky) */}
          <div className="md:col-span-1 lg:sticky lg:top-24 h-fit">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={member.image} alt={member.name} data-ai-hint={member.dataAiHint} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="font-headline text-2xl font-bold tracking-wider">{member.name}</h1>
                <p className="text-sm text-primary whitespace-pre-line">{member.title}</p>
                <p className="mt-4 text-sm text-muted-foreground">{member.bio}</p>
                
                {socialLinks.length > 0 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {socialLinks.map(link => (
                            <Button key={link.platform} asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                <a href={link.href} target="_blank" rel="noopener noreferrer">
                                    {link.icon}
                                    <span className="sr-only">{link.platform}</span>
                                </a>
                            </Button>
                        ))}
                    </div>
                )}

                <div className="w-full mt-6 flex flex-col gap-2">
                    <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                        <SelectContent>
                            {memberServices.map(service => service && (
                                <SelectItem key={service.value} value={service.value}>{service.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        asChild
                        className={cn("font-bold flex-shrink-0", !selectedService && "opacity-50 pointer-events-none")}
                    >
                        <Link 
                            href={`/appointment?service=${selectedService}&counselor=${member.value}&from=team`} 
                            onClick={(e) => {
                                if (!selectedService) {
                                    e.preventDefault();
                                    return;
                                }
                                setLoading(true)
                            }}
                            aria-disabled={!selectedService}
                        >
                            Book an Appointment
                        </Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-1 lg:col-span-2 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Areas of Expertise</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {member.expertise.map((item, i) => <Badge key={i} variant="secondary">{item}</Badge>)}
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Education</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                        {member.education.map((edu, i) => <li key={i}>{edu}</li>)}
                    </ul>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                        {member.experience.map((exp, i) => <li key={i}>{exp}</li>)}
                    </ul>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </>
  );
}
