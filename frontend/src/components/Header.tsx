"use client";
import Link from 'next/link';
import { ShoppingBag, ChevronDown, Menu, CakeSlice } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const { items, toggleDrawer } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-kt-champagne/95 backdrop-blur-md border-b border-kt-chocolate/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Wordmark Logo: minimalist cupcake icon + brand wordmark */}
          <Link href="/" data-testid="brand-logo-link" className="flex items-center gap-2 group">
            <CakeSlice className="w-7 h-7 text-kt-rouge shrink-0" strokeWidth={1.75} />
            <span className="font-[family-name:var(--font-wordmark)] text-xl md:text-2xl leading-none tracking-tight text-kt-chocolate">
              KINGDOM <span className="text-kt-rouge">TREATZ</span>
            </span>
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
            <button className="md:hidden text-kt-chocolate p-2 hover:text-kt-rouge transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}