
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <div className={cn('bg-primary/5 border-b', className)}>
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-3 md:px-6">
        <ol className="flex flex-wrap items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center space-x-2 truncate">
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              {item.href && index < items.length - 1 ? (
                <Link href={item.href} className="hover:text-primary transition-colors truncate">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground truncate">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
