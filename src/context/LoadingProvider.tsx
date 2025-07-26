
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

function TopLoader() {
    return (
        <div className="fixed top-0 left-0 w-full h-0.5 z-[9999] pointer-events-none">
            <div className="h-full bg-primary/20 overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear',
                    }}
                    style={{
                        width: '100%',
                        transformOrigin: 'left',
                    }}
                />
            </div>
        </div>
    );
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      <AnimatePresence>
        {isLoading && <TopLoader />}
      </AnimatePresence>
      {children}
    </LoadingContext.Provider>
  );
}
