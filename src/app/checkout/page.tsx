"use client";

import { useState, useMemo, useEffect, useRef, FormEvent } from 'react';
import { useCartStore } from '@/store/cartStore';
import { getAvailablePickupDates } from '@/lib/pickup';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

type SquarePayments = any;

declare global {
  interface Window {
    SqPaymentForm?: any;
    Square?: any;
  }
}

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [status, setStatus] = useState<'idle' | 'initializing' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '' // YYYY-MM-DD, matches one of pickupAvailability.options
  });

  // Tracks the Square card input lifecycle so the UI never shows a dead,
  // input-looking box: unconfigured = missing public keys, error = SDK failed.
  const [cardStatus, setCardStatus] = useState<'loading' | 'ready' | 'unconfigured' | 'error'>('loading');
  const [cardStatusMessage, setCardStatusMessage] = useState('');

  const cardRef = useRef<any>(null);
  const paymentsRef = useRef<SquarePayments | null>(null);

  const hasItems = items.length > 0;

  // Every Friday/Saturday up to 30 days out, governed by the Wednesday 9 PM
  // America/New_York cutoff shared with the admin portal — lets clients book
  // ahead for events instead of only the very next weekend.
  const pickupAvailability = useMemo(() => getAvailablePickupDates(), []);
  const selectedPickupOption = pickupAvailability.options.find((opt) => opt.date === formData.pickupDate);

  useEffect(() => {
    // The #card-container div only exists while the cart has items, so the
    // Square card input can only be attached once the form is on screen.
    if (!hasItems) return;

    const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION;
    if (!applicationId || !locationId) {
      setCardStatus('unconfigured');
      setCardStatusMessage('Online payment is temporarily unavailable. Please contact us to complete your order.');
      return;
    }

    let cancelled = false;
    setCardStatus('loading');

    const init = async () => {
      try {
        // @ts-ignore
        const payments = await window.Square.payments(applicationId, locationId);
        if (cancelled) return;
        paymentsRef.current = payments;

        const card = await payments.card();
        if (cancelled) {
          card.destroy();
          return;
        }
        cardRef.current = card;
        await card.attach('#card-container');
        if (cancelled) {
          card.destroy();
          cardRef.current = null;
          return;
        }
        setCardStatus('ready');
      } catch (err: any) {
        console.error('Square payments init error', err);
        if (!cancelled) {
          setCardStatus('error');
          setCardStatusMessage('The secure card form failed to load. Please refresh the page or try a different browser.');
        }
      }
    };

    const onScriptError = () => {
      console.error('Failed to load Square Web Payments SDK');
      if (!cancelled) {
        setCardStatus('error');
        setCardStatusMessage('The secure card form could not be loaded. Please check your connection and refresh the page.');
      }
    };

    if (window.Square) {
      init();
    } else {
      // Sandbox application IDs start with "sandbox-"; use the matching SDK
      // unless the environment is set explicitly.
      const env = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || (applicationId.startsWith('sandbox-') ? 'sandbox' : 'production')).toLowerCase();
      const src = env === 'production' ? 'https://web.squarecdn.com/v1/square.js' : 'https://sandbox.web.squarecdn.com/v1/square.js';
      let script = document.querySelector<HTMLScriptElement>('script[data-square-sdk]');
      if (!script) {
        script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.squareSdk = 'true';
        document.head.appendChild(script);
      }
      script.addEventListener('load', init);
      script.addEventListener('error', onScriptError);
    }

    return () => {
      cancelled = true;
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
    };
  }, [hasItems]);

  const tokenizeCard = async () => {
    if (!cardRef.current) throw new Error('Payment form not initialized');
    const result = await cardRef.current.tokenize();
    if (result.status === 'OK' && result.token) return result.token;
    const errors = result.errors?.map((e: any) => e.message).join(', ') || 'Card tokenization failed';
    throw new Error(errors);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Ensure pickup date set
      if (!selectedPickupOption) throw new Error('Please select a pickup date');

      if (cardStatus !== 'ready') {
        throw new Error(cardStatusMessage || 'The card form is not ready yet. Please wait a moment and try again.');
      }

      // Tokenize card client-side
      const sourceId = await tokenizeCard();

      // Build minimal items payload (id + quantity)
      const payloadItems = items.map((it: any) => ({ id: it.id, quantity: it.quantity }));

      const payload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pickupDate: selectedPickupOption!.date,
          pickupDay: selectedPickupOption!.day,
        },
        items: payloadItems,
        sourceId,
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        const err = data?.error || (data?.errors && data.errors.map((e: any) => e.detail || e).join(', ')) || 'Payment failed';
        throw new Error(err);
      }

      setStatus('success');
      clearCart();
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] bg-kt-champagne flex flex-col items-center justify-center p-4">
        <CheckCircle2 className="w-20 h-20 text-kt-emerald mb-6" />
        <h1 className="font-serif text-4xl font-bold text-kt-chocolate mb-4 text-center">Your Order Is Confirmed</h1>
        <p className="font-sans text-lg text-kt-chocolate/80 max-w-lg text-center mb-8">
          Thank you, {formData.name}! Your payment has been received and your order is on the calendar. We&apos;ll see you at pickup &mdash; reach out anytime at info@kingdomtreatzrva.com.
        </p>
        <Link href="/" className="px-8 py-4 bg-kt-chocolate text-kt-champagne font-display tracking-wider text-sm uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-kt-champagne min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/menu" className="inline-flex items-center text-kt-rouge hover:text-kt-chocolate transition-colors font-display text-xs tracking-wider uppercase mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Menu
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-kt-chocolate mb-12">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-kt-chocolate/10 rounded-sm">
            <p className="font-sans text-xl text-kt-chocolate/60 mb-6">Your cart is currently empty.</p>
            <Link href="/menu" className="px-8 py-4 bg-kt-rouge text-white font-display tracking-wider text-sm uppercase rounded-sm hover:bg-kt-rouge/90 transition-colors">
              Browse
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-sm shadow-sm border border-kt-chocolate/5">
                <h2 className="font-serif text-2xl font-bold text-kt-chocolate mb-6 pb-4 border-b border-kt-chocolate/10">Customer Details</h2>

                {status === 'error' && (
                  <div className="mb-6 p-4 bg-kt-rouge/10 border border-kt-rouge text-kt-rouge rounded-sm font-sans text-sm">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Email Address *</label>
                    <input 
                      type="email" 
                      required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors" 
                      />
                  </div>

                  <div>
                    <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Select Pickup Date *</label>
                    <select
                      required
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                      className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors font-sans"
                    >
                      <option value="" disabled>Choose a Friday or Saturday...</option>
                      {pickupAvailability.options.map((opt) => (
                        <option key={opt.date} value={opt.date}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="mt-2 font-sans text-xs text-kt-chocolate/60">Book up to 30 days ahead. Orders must be placed by Wednesday 9 PM for that weekend&apos;s pickup.</p>
                    {pickupAvailability.cutoffPassed && (
                      <p data-testid="pickup-cutoff-note" className="mt-2 font-sans text-xs text-kt-rouge">Orders for this week have closed; the earliest pickup is now the following weekend.</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Card Details</label>
                    <div id="card-container" className={cardStatus === 'ready' ? 'p-4 bg-kt-champagne/50 border border-kt-chocolate/10 rounded-sm' : 'h-0 overflow-hidden'}></div>
                    {cardStatus === 'loading' && (
                      <div className="p-4 bg-kt-champagne/50 border border-kt-chocolate/10 rounded-sm font-sans text-sm text-kt-chocolate/60">
                        Loading secure payment form...
                      </div>
                    )}
                    {(cardStatus === 'unconfigured' || cardStatus === 'error') && (
                      <div className="p-4 bg-kt-rouge/10 border border-kt-rouge rounded-sm font-sans text-sm text-kt-rouge">
                        {cardStatusMessage}
                      </div>
                    )}
                    <p className="mt-2 font-sans text-xs text-kt-chocolate/60">Payments are processed securely by Square. Card details never touch our servers.</p>
                    <div data-testid="square-approved-badge" className="mt-4 inline-flex items-center">
                      <Image
                        src="https://images.ctfassets.net/1nw4q0oohfju/7ntgEwkWoRRGdTu91jr9yd/62d9d5b8a06107447c15cbbfffd2abb7/brand_black-f67a0600187e707deb22521e86452dd6746851870f815e9e454423b9e5b8a6d3.png"
                        alt="Built with Square"
                        width={140}
                        height={28}
                        unoptimized
                        className="h-6 w-auto"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    data-testid="checkout-submit-button"
                    disabled={status === 'submitting' || cardStatus !== 'ready'}
                    className="w-full py-4 mt-8 bg-kt-chocolate text-kt-champagne font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors disabled:opacity-60"
                  >
                    {status === 'submitting' ? 'Processing...' : 'Pay'}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="bg-kt-chocolate text-kt-champagne p-8 rounded-sm sticky top-24 md:top-40">
                <h2 className="font-serif text-2xl font-bold mb-6 pb-4 border-b border-kt-champagne/20">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm font-sans">
                      <div className="flex-1 pr-4">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-kt-champagne/60 text-xs mt-1">Qty: {item.quantity} · {item.qtyDescription}</p>
                      </div>
                      <div className="font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-kt-champagne/20 flex justify-between items-center text-lg">
                  <span className="font-sans">Subtotal</span>
                  <span className="font-serif font-bold text-2xl">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
