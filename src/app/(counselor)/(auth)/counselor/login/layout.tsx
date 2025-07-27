
import { CounselorAuthProvider } from '@/context/CounselorAuthContext';

// This is the layout for pages that do not require the sidebar, like the login page.
export default function CounselorAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CounselorAuthProvider>
      {children}
    </CounselorAuthProvider>
  )
}
