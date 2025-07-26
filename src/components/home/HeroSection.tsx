
'use client';

import { useState, useEffect, useRef } from 'react'; // Import useRef
import type { CarouselApi } from "@/components/ui/carousel"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
    {
        image: 'https://domf5oio6qrcr.cloudfront.net/medialibrary/7813/a83db567-4c93-4ad0-af6f-72b57af7675d.jpg',
        alt: 'Therapist providing compassionate care',
        badge: 'COMPASSIONATE CARE',
        title: 'Professional Therapy For You',
        description: 'Experience personalized, one-on-one therapy sessions with our licensed professionals in a safe and supportive environment.',
        buttons: [
            { href: '/services', label: 'Book a Session', variant: 'secondary' },
            { href: '/about', label: 'Learn More', variant: 'outline' }
        ]
    },
    {
        image: 'https://assets.theinnerhour.com/bloguploads/Depression%20causes%20types%20and%20signs1594105476385.jpg',
        alt: 'A person finding support for depression',
        badge: 'CONNECT & HEAL',
        title: 'Find Strength in Community',
        description: 'Join our support groups to share your journey and connect with peers who understand. A safe space for healing and growth.',
        buttons: [
            { href: '/services', label: 'Explore Groups', variant: 'secondary' },
            { href: '/about', label: 'Learn More', variant: 'outline' }
        ]
    },
    {
        image: '/resourse_library.jpeg',
        dataAiHint: 'wellness app',
        alt: 'Person using a wellness app',
        badge: 'YOUR PATH TO WELLNESS',
        title: 'AI-Powered Recommendations',
        description: 'Receive personalized recommendations for resources and services tailored to your needs with our intelligent wellness tool.',
        buttons: [
            { href: '/contact', label: 'Get Started', variant: 'secondary' },
            { href: '/blogs', label: 'Browse Our Blog', variant: 'outline' }
        ]
    }
];

export function HeroSection() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Ref for the timer

    // Effect for handling carousel selection changes
    useEffect(() => {
        if (!api) {
          return
        }

        const handleSelect = () => {
            setCurrent(api.selectedScrollSnap())
        }

        api.on("select", handleSelect)
        handleSelect() // Initialize current slide
    
        return () => {
          api.off("select", handleSelect)
        }
    }, [api])

    // Effect for auto-play functionality
    useEffect(() => {
        if (!api) return;

        const autoPlay = () => {
            timerRef.current = setTimeout(() => {
                api.scrollNext();
            }, 8000); // Auto-slide every 8 seconds (8000ms)
        };

        // Clear existing timer on select or init
        const stopAndRestartAutoPlay = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            autoPlay();
        };

        api.on("select", stopAndRestartAutoPlay);
        api.on("pointerDown", () => {
             if (timerRef.current) clearTimeout(timerRef.current);
        });
        api.on("pointerUp", stopAndRestartAutoPlay);


        // Clear timer on carousel destroy (component unmount)
        api.on("destroy", () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        });

        autoPlay(); // Start auto-play when component mounts or api becomes available

        return () => {
            // Clean up timer when component unmounts
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [api]); // Re-run effect if api changes

  return (
      <section className="relative w-full h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Carousel
            setApi={setApi}
            className="w-full h-full"
            opts={{ loop: true }}
        >
          <AnimatePresence>
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={slides[current].image}
                alt={slides[current].alt}
                fill
                className="object-cover"
                {...(slides[current].dataAiHint && { "data-ai-hint": slides[current].dataAiHint })}
                priority={current === 0}
              />
              <div className="absolute inset-0 bg-primary/70" />
            </motion.div>
          </AnimatePresence>

          <CarouselContent className="h-full -ml-0">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-full p-0">
                <div className="container mx-auto h-full flex flex-col justify-center pt-20">
                    {current === index && (
                    <motion.div
                        className="relative z-10 max-w-2xl text-white space-y-4 md:space-y-6" 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'circOut', delay: 0.5 }}
                      >
                        <div className="flex justify-start"> 
                            <Badge variant="outline" className="text-white border-white/80 backdrop-blur-sm">{slide.badge}</Badge>
                        </div>
                        <h1 className="font-headline text-3xl sm:text-4xl font-medium tracking-wider md:text-6xl uppercase">
                          {slide.title}
                        </h1>
                        <p className="text-sm sm:text-base text-white/90 md:text-lg">
                          {slide.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-start items-start sm:items-center pt-2"> 
                          {slide.buttons.map((button) => (
                            <Button key={button.href} asChild size="lg" variant={button.variant} className={cn("font-bold w-full sm:w-auto", button.variant === 'outline' && "bg-transparent text-white border-white hover:bg-white hover:text-primary transition-all duration-300")}>
                              <Link href={button.href}>{button.label}</Link>
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 border-none text-white" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 border-none text-white" />
        </Carousel>
      </section>
  );
}
