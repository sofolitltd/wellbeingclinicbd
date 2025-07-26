
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function AppCtaSection() {
    return (
        <section 
            className="w-full py-16 md:py-24"
        >
            <div className="container mx-auto grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
                <div 
                    className="lg:order-last overflow-hidden rounded-lg"
                >
                    <Image
                        src="/google_play.jpeg"
                        alt="Wellbeing Clinic Mobile App"
                        width={600}
                        height={600}
                        className=" rounded-3xl object-cover  transition-transform duration-500 hover:scale-110"
                        data-ai-hint="mobile app screen"
                    />
                </div>
                <div 
                    className="space-y-4"
                >
                    <h2 className="font-headline text-3xl font-bold tracking-wider sm:text-4xl uppercase">Take Wellbeing With You</h2>
                    <p className="text-muted-foreground md:text-lg">
                        Download our app to access resources, track your mood, and connect with support anytime, anywhere. Available on the Play Store.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Mood Tracking</li>
                        <li>Psychological Assessment</li>
                        <li>AI Assistant</li>
                        <li>Psycho Education and more</li>
                    </ul>

                    <Link 
                        href="https://play.google.com/store/apps/details?id=com.sofolit.wellbeingclinic&pcampaignid=web_share"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={'/google_play_btn.png'}
                            height={75}
                            width={200}
                            alt="Google Play Store"
                              className=" 
                              mt-4 -ml-2 font-bold transition-transform duration-300 hover:scale-105"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}
