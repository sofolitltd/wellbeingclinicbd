
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function ContactSection() {
    return (
       <section 
            className="w-full py-16 md:py-24"
        >
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-primary">
             <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-12 text-primary-foreground relative z-10">
                <h2 className="font-headline text-3xl font-bold tracking-wider uppercase">Ready to Take the Next Step?</h2>
                <p className="mt-4 text-primary-foreground/90">
                  We're here to help you on your journey. Reach out to our team to discuss your needs and find the right support.
                </p>
                <div className="mt-6">
                  <Button asChild variant="secondary" size="lg" className="font-bold transition-transform duration-300 hover:scale-105">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
              <div className="h-full w-full hidden md:block relative">
                  <Image
                    src="/ai_recommendations.jpeg"
                    alt="AI tool"
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                    data-ai-hint="friendly robot"
                  />
              </div>
             </div>
          </div>
        </div>
       </section>
    );
}
