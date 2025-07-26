
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { LoadingProvider } from '@/context/LoadingProvider';
import { ClientAuthProvider } from '@/context/ClientAuthContext';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthProvider>
      <LoadingProvider>
        <div className="relative flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </LoadingProvider>
    </ClientAuthProvider>
  );
}
