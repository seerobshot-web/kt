"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-kt-champagne/20 bg-kt-chocolate text-kt-champagne">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Responsive header row: compact on mobile, tall on desktop */}
        <div className="flex justify-between items-center h-16 md:h-36">
          {/* Logo — responsive size so it never crushes small viewports */}
          <Link href="/" className="relative flex items-center h-10 w-32 md:h-28 md:w-72 shrink-0">
            <Image
              src="/logo.png"
              alt="Kingdom Treatz"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium tracking-wide hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/checkout"
              className="flex items-center gap-2 rounded-sm bg-kt-champagne px-5 py-2 font-semibold text-kt-chocolate hover:bg-white transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Cart
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            aria-label="Toggle menu"
            className="md:hidden p-2"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium py-1 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-kt-champagne px-5 py-2 font-semibold text-kt-chocolate"
            >
              <ShoppingBag className="h-5 w-5" />
              Cart
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
