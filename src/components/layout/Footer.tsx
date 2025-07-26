import Link from 'next/link';
import Image from 'next/image';

const Logo = () => (
  <div className="flex items-center gap-1 transition-transform duration-300 hover:scale-105">
    <Image
      src="/wb_logo.png"
      alt="wellbeing Clinic Logo"
      width={30}
      height={30}
      data-ai-hint="wellbeing Clinic Logo"
    />
    <div className="flex flex-col">
      <span className="font-headline text-[17px] font-bold uppercase tracking-widest text-foreground">
        Wellbeing Clinic
      </span>
      <span className="text-[9.5px] text-muted-foreground -mt-1">
        Your partner in mental wellness
      </span>
    </div>
  </div>
);


export function Footer() {
  return (
    <footer className="w-full bg-card/50 py-8 mt-16 shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-4 md:mb-0">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        </div>
        <div className="flex gap-4">
          <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms & Conditions
          </Link>
        </div>
        <div className="mt-4 md:mt-0 text-center md:text-right">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Wellbeing Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
