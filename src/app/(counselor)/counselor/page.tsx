
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCounselorAuth, CounselorAuthProvider } from '@/context/CounselorAuthContext';
import { Loader2 } from 'lucide-react';

function CounselorRedirectLogic() {
  const { user, loading } = useCounselorAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/counselor/dashboard');
      } else {
        router.replace('/counselor/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-muted/40">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function CounselorRedirectPage() {
    // This page needs its own provider since it's outside the protected layout.
    return (
        <CounselorAuthProvider>
            <CounselorRedirectLogic />
        </CounselorAuthProvider>
    )
}
