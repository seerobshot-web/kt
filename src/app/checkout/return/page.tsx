"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface CheckoutStatus {
  paid: boolean;
  state: string;
  customerName: string | null;
  pickupLabel: string | null;
  totalCents: number;
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutReturnContent />
    </Suspense>
  );
}

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const clearCart = useCartStore((state) => state.clearCart);
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (status?.paid) clearCart();
  }, [status?.paid, clearCart]);

  // Square confirms the payment to us asynchronously via webhook, so the
  // order can briefly still look unpaid the instant the browser lands back
  // here. Poll for up to ~30s, which comfortably covers normal webhook
  // delivery latency.
  useEffect(() => {
    if (!orderId) return;
    if (status?.paid) return;
    if (attempts >= 15) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/checkout/status?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to check order status.');
        setStatus(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setAttempts((n) => n + 1);
      }
    }, attempts === 0 ? 0 : 2000);

    return () => clearTimeout(timer);
  }, [orderId, attempts, status?.paid]);

  if (!orderId) {
    return (
      <div className="min-h-[80vh] bg-kt-champagne flex flex-col items-center justify-center p-4">
        <p className="font-sans text-lg text-kt-chocolate/80">Missing order reference.</p>
        <Link href="/menu" className="mt-6 px-8 py-4 bg-kt-chocolate text-kt-champagne font-display tracking-wider text-sm uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors">
          Back to Menu
        </Link>
      </div>
    );
  }

  const stillWaiting = !status?.paid && attempts >= 15;

  return (
    <div className="min-h-[80vh] bg-kt-champagne flex flex-col items-center justify-center p-4 text-center">
      {status?.paid ? (
        <>
          <CheckCircle2 className="w-20 h-20 text-kt-emerald mb-6" />
          <h1 className="font-serif text-4xl font-bold text-kt-chocolate mb-4">Your Order Is Confirmed</h1>
          <p className="font-sans text-lg text-kt-chocolate/80 max-w-lg mb-2">
            Thank you{status.customerName ? `, ${status.customerName}` : ''}! Your payment of ${(status.totalCents / 100).toFixed(2)} has been received.
          </p>
          {status.pickupLabel && (
            <p className="font-sans text-lg text-kt-chocolate/80 max-w-lg mb-8">Pickup: {status.pickupLabel}</p>
          )}
          <p className="font-sans text-sm text-kt-chocolate/60 mb-8">
            Reach out anytime at info@kingdomtreatzrva.com.
          </p>
        </>
      ) : (
        <>
          <Clock className="w-16 h-16 text-kt-chocolate/40 mb-6 animate-pulse" />
          <h1 className="font-serif text-3xl font-bold text-kt-chocolate mb-4">
            {stillWaiting ? 'Still Confirming Your Payment' : 'Confirming Your Payment...'}
          </h1>
          <p className="font-sans text-lg text-kt-chocolate/80 max-w-lg mb-8">
            {stillWaiting
              ? "This is taking longer than usual. If you completed payment, you'll receive a confirmation email shortly — no need to pay again."
              : "One moment while we confirm your payment with Square."}
          </p>
        </>
      )}
      {error && <p className="font-sans text-sm text-kt-rouge mb-6">{error}</p>}
      <Link href="/" className="px-8 py-4 bg-kt-chocolate text-kt-champagne font-display tracking-wider text-sm uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors">
        Home
      </Link>
    </div>
  );
}
