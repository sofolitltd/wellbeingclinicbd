
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useClientAuth } from '@/context/ClientAuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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


export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const { user, logOut, loading } = useClientAuth();

  const navLinks = [
    { href: `/`, label: 'Home' },
    { href: `/services`, label: 'Services' },
    { href: `/blogs`, label: 'Blog' },
    { href: `/about`, label: 'About Us' },
    { href: `/contact`, label: 'Contact' },
  ];

  const handleLinkClick = () => {
    setSheetOpen(false);
  };

  return (
    <header className="z-50 w-full sticky top-0 border-b bg-background shadow-sm">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        <Link href={`/`} className="flex items-center" onClick={handleLinkClick}>
          <Logo />
        </Link>

        <nav className="relative hidden items-center gap-6 lg:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {label}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="underline"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className='flex gap-2 items-center'>
          <div className="hidden md:flex items-center gap-2">
            <Button asChild>
              <Link href={`/appointment`}>Appointment</Link>
            </Button>
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                        <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logOut}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="outline">
                  <Link href={`/login`}>Login</Link>
                </Button>
              )
            )}
          </div>

          <div className="lg:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background">
                <div className="flex flex-col gap-6 pt-10">
                  <Link href={`/`} className="flex items-center mb-4" onClick={handleLinkClick}>
                    <Logo />
                  </Link>
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={handleLinkClick}
                      className={cn(
                        'text-lg font-medium transition-colors',
                        pathname === href ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-4 mt-4">
                     <Button asChild className="font-bold">
                        <Link href={`/appointment`} onClick={handleLinkClick}>Appointment</Link>
                     </Button>
                     {user ? (
                       <Button asChild variant="outline" className="font-bold">
                        <Link href={`/dashboard`} onClick={handleLinkClick}>Dashboard</Link>
                       </Button>
                     ) : (
                       <Button asChild variant="outline" className="font-bold">
                        <Link href={`/login`} onClick={handleLinkClick}>Login</Link>
                       </Button>
                     )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}
