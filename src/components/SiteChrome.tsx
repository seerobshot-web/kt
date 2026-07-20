"use client";
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

// Admin portal has its own layout/chrome (src/app/admin/layout.tsx) — keep
// the customer-facing Header/Footer/cart off of every /admin/* route.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
