
'use client'

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Loader2, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const contactDetails = [
  {
    icon: <Mail className="h-5 w-5 text-primary" />,
    label: 'Email Address',
    value: 'wellbeingclinicbd@gmail.com',
    href: 'mailto:wellbeingclinicbd@gmail.com',
  },
  {
    icon: <Phone className="h-5 w-5 text-primary" />,
    label: 'Phone Number',
    value: '01823161333',
    href: 'tel:+8801823161333',
  },
  {
    icon: <MapPin className="h-5 w-5 text-primary" />,
    label: 'Office Address',
    value: 'Uttor Badda, Dhaka, Bangladesh',
    href: 'https://www.google.com/maps/search/?api=1&query=Uttor+Badda,Dhaka,Bangladesh',
  },
];

const socialLinks = [
  { icon: <Facebook className="h-5 w-5" />, href: 'https://fb.com/wellbeingclinicbd', label: 'Facebook' },
  { icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com/wellbeingclinicbd', label: 'Instagram' },
  { icon: <Youtube className="h-5 w-5" />, href: 'https://youtube.com/@wellbeingclinicbd', label: 'YouTube' },
  { icon: <MessageCircle className="h-5 w-5" />, href: 'https://wa.me/8801823161333', label: 'WhatsApp' },
];

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

export function ContactClientPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { name, phone, message } = formData;
        if (!name || !phone || !message) {
            toast({
                variant: 'destructive',
                title: "Incomplete Form",
                description: "Please fill out all fields.",
            });
            setIsSubmitting(false);
            return;
        }

        const whatsappMessage = `Hello Wellbeing Clinic,\nI'm contacting you from your website.\n\n*Name:* ${name}\n*Mobile:* ${phone}\n\n*Message:*\n${message}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/8801823161333?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        
        toast({
            title: "Redirecting to WhatsApp",
            description: "Please send the pre-filled message in WhatsApp.",
        });

        setFormData({ name: '', phone: '', message: '' });
        setIsSubmitting(false);
    }

  return (
      <motion.div 
        className="container mx-auto px-4 py-16 md:px-6"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <div className="space-y-12">
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="font-headline text-4xl font-bold tracking-wider sm:text-5xl uppercase">Get In Touch</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We're here to help. Reach out with any questions or to schedule a consultation.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-12" variants={itemVariants}>
              <Card className="shadow-2xl">
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl uppercase tracking-wider">Contact Information</CardTitle>
                      <CardDescription>Visit us or connect on social media.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {contactDetails.map((detail) => (
                           <a 
                                key={detail.label} 
                                href={detail.href} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                            >
                              <div className="flex-shrink-0 mt-1">{detail.icon}</div>
                              <div>
                                <h3 className="font-semibold text-foreground">{detail.label}</h3>
                                <p className="text-muted-foreground group-hover:text-primary transition-colors">{detail.value}</p>
                              </div>
                          </a>
                      ))}
                      <div className="flex justify-start gap-4 pt-4">
                        {socialLinks.map(social => (
                            <Button key={social.label} asChild variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-muted">
                                <a href={social.href} target="_blank" rel="noopener noreferrer">
                                    {social.icon}
                                    <span className="sr-only">{social.label}</span>
                                </a>
                            </Button>
                        ))}
                      </div>
                  </CardContent>
              </Card>
              <Card className="shadow-2xl">
                <CardHeader>
                        <div>
                            <CardTitle className="font-headline text-2xl uppercase tracking-wider">Send a Message via WhatsApp</CardTitle>
                            <CardDescription>Fill out the form below to start a chat with us.</CardDescription>
                        </div>
                        
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="Your Name" required value={formData.name} onChange={handleChange}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Mobile Number</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="Your mobile number" required value={formData.phone} onChange={handleChange}/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" placeholder="How can we help you?" rows={5} required value={formData.message} onChange={handleChange}/>
                    </div>
                    <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                      {isSubmitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</>
                      ) : (
                          <><Send className="mr-2 h-4 w-4" /> Send Message</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
          </motion.div>
        </div>
      </motion.div>
  );
}
