
import { ClientAuthProvider } from '@/context/ClientAuthContext';

// This layout ensures that pages within the (auth) group, like login and signup,
// do not inherit the main website header and footer, providing a cleaner interface.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientAuthProvider>{children}</ClientAuthProvider>;
}
