'use client';

import { ClipboardList, HeartHandshake, Laptop, Phone, Smile, UserCheck } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

interface Benefit {
    icon: ReactNode;
    title: string;
    description: string;
}

const benefitsLeft: Benefit[] = [
    {
        icon: <HeartHandshake className="size-8 text-secondary-foreground" />,
        title: "Best Counseling",
        description: "Receive top-tier support from our licensed and compassionate therapists.",
    },
    {
        icon: <ClipboardList className="size-8 text-secondary-foreground" />,
        title: "Personalized Plans",
        description: "We tailor our approach to your unique needs and goals for effective, lasting change.",
    },
    {
        icon: <UserCheck className="size-8 text-secondary-foreground" />,
        title: "Expert Professionals",
        description: "Our team consists of experienced and credentialed mental health experts.",
    },
];

const benefitsRight: Benefit[] = [
     {
        icon: <Phone className="size-8 text-secondary-foreground" />,
        title: "24/7 Support",
        description: "Access to resources and support whenever you need it most.",
    },
    {
        icon: <Laptop className="size-8 text-secondary-foreground" />,
        title: "Online Sessions",
        description: "Connect with your therapist from the comfort and privacy of your home.",
    },
    {
        icon: <Smile className="size-8 text-secondary-foreground" />,
        title: "Welcoming Environment",
        description: "We provide a safe, non-judgmental space for you to heal and grow.",
    },
]

export function WhyChooseUsSection() {
    return (
        
        <section 
            className="w-full py-16 md:py-24 bg-primary/5"
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-headline text-3xl font-semibold tracking-wider sm:text-4xl uppercase">Why People Choose Us</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">
                    Discover the Difference Our Community Makes.
                    </p>
                    
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-x-12 gap-y-16">
                    
                    <div className="space-y-12">
                        {benefitsLeft.map(benefit => (
                            <div key={benefit.title} className="flex items-center gap-6 lg:flex-row-reverse lg:text-right">
                                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h3 className="font-headline text-xl uppercase tracking-wider font-bold">{benefit.title}</h3>
                                    <p className="text-muted-foreground mt-1">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div 
                        className="order-first lg:order-none"
                    >
                        <Image
                            src="/why_we.jpeg"
                            alt="Group seiion"
                            width={500}
                            height={500}
                            className="rounded-full aspect-square object-cover mx-auto shadow-2xl border-8 border-background"
                            data-ai-hint="group session"
                        />
                    </div>

                     <div className="space-y-12">
                        {benefitsRight.map(benefit => (
                            <div key={benefit.title} className="flex items-center gap-6">
                                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h3 className="font-headline text-xl uppercase tracking-wider font-bold">{benefit.title}</h3>
                                    <p className="text-muted-foreground mt-1">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
