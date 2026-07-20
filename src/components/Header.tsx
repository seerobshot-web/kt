"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ChevronDown, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const TREATZ_CATEGORIES = [
  { label: 'Signature Puddings', href: '/menu?category=Signature Puddings' },
  { label: 'Artisan Cakes', href: '/menu?category=Artisan Cakes' },
  { label: 'Southern Pies', href: '/menu?category=Southern Pies' },
  { label: 'Cobblers', href: '/menu?category=Cobblers' },
  { label: 'Cookies', href: '/menu?category=Cookies' },
];

export default function Header() {
  const { items, toggleDrawer } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [treatzOpen, setTreatzOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
    setTreatzOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-kt-champagne/95 backdrop-blur-md border-b border-kt-chocolate/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Wordmark Logo */}
          <Link href="/" data-testid="brand-logo-link" className="relative flex items-center h-14 w-36 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Kingdom Treatz"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center font-display text-sm tracking-wider">
            <Link href="/" className="text-kt-chocolate hover:text-kt-rouge transition-colors">HOME</Link>
            
            {/* Mega Menu Trigger */}
            <div className="relative group">
              <button className="flex items-center text-kt-chocolate hover:text-kt-rouge transition-colors py-8">
                TREATZ <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              {/* Dropdown Content */}
              <div className="absolute left-0 mt-0 w-56 bg-kt-champagne border border-kt-chocolate/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2 flex flex-col">
                  <Link href="/menu?category=Signature Puddings" className="px-4 py-3 text-kt-chocolate hover:bg-kt-chocolate hover:text-kt-champagne transition-colors">Signature Puddings</Link>
                  <Link href="/menu?category=Artisan Cakes" className="px-4 py-3 text-kt-chocolate hover:bg-kt-chocolate hover:text-kt-champagne transition-colors">Artisan Cakes</Link>
                  <Link href="/menu?category=Southern Pies" className="px-4 py-3 text-kt-chocolate hover:bg-kt-chocolate hover:text-kt-champagne transition-colors">Southern Pies</Link>
                  <Link href="/menu?category=Cobblers" className="px-4 py-3 text-kt-chocolate hover:bg-kt-chocolate hover:text-kt-champagne transition-colors">Cobblers</Link>
                  <Link href="/menu?category=Cookies" className="px-4 py-3 text-kt-chocolate hover:bg-kt-chocolate hover:text-kt-champagne transition-colors">Cookies</Link>
                </div>
              </div>
            </div>

            <Link href="/specials" className="text-kt-chocolate hover:text-kt-rouge transition-colors">SPECIALS</Link>
            <Link href="/learn-more" className="text-kt-chocolate hover:text-kt-rouge transition-colors">LEARN MORE</Link>
            <Link href="/menu" className="text-kt-chocolate hover:text-kt-rouge transition-colors">ORDER ONLINE</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDrawer}
              className="relative text-kt-chocolate hover:text-kt-rouge transition-colors p-2"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-kt-rouge rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden text-kt-chocolate p-2 hover:text-kt-rouge transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Panel */}
        {mobileOpen && (
          <nav id="mobile-nav-panel" className="md:hidden pb-6 font-display text-sm tracking-wider">
            <div className="flex flex-col space-y-1">
              <Link href="/" onClick={closeMobile} className="px-2 py-3 text-kt-chocolate hover:text-kt-rouge transition-colors border-b border-kt-chocolate/10">HOME</Link>

              <button
                type="button"
                onClick={() => setTreatzOpen((open) => !open)}
                aria-expanded={treatzOpen}
                className="flex items-center justify-between px-2 py-3 text-kt-chocolate hover:text-kt-rouge transition-colors border-b border-kt-chocolate/10"
              >
                TREATZ <ChevronDown className={`w-4 h-4 transition-transform ${treatzOpen ? 'rotate-180' : ''}`} />
              </button>
              {treatzOpen && (
                <div className="flex flex-col pl-4 bg-kt-chocolate/5">
                  {TREATZ_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={closeMobile}
                      className="px-2 py-3 text-kt-chocolate/90 hover:text-kt-rouge transition-colors border-b border-kt-chocolate/10 normal-case font-sans text-base"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/specials" onClick={closeMobile} className="px-2 py-3 text-kt-chocolate hover:text-kt-rouge transition-colors border-b border-kt-chocolate/10">SPECIALS</Link>
              <Link href="/learn-more" onClick={closeMobile} className="px-2 py-3 text-kt-chocolate hover:text-kt-rouge transition-colors border-b border-kt-chocolate/10">LEARN MORE</Link>
              <Link href="/menu" onClick={closeMobile} className="px-2 py-3 text-kt-chocolate hover:text-kt-rouge transition-colors">ORDER ONLINE</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}