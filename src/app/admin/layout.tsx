"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/take-payment', label: 'Take Payment' },
  { href: '/admin/invoices/new', label: 'New Invoice' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return <>{children}</>;

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold">Kingdom Treatz — Admin</span>
          <nav className="flex items-center gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`admin-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={pathname === item.href ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}
              >
                {item.label}
              </Link>
            ))}
            <button data-testid="admin-logout-button" onClick={logout} className="text-gray-300 hover:text-white">
              Log Out
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
