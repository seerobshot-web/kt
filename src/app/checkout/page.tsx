"use client";

import { useState, useMemo, FormEvent } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: ''
  });

  // Generate the next 6 available Fridays and Saturdays
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    // Start looking from tomorrow to prevent same-day
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + 1);

    while (dates.length < 6) {
      const day = currentDate.getDay();
      // 5 = Friday, 6 = Saturday
      if (day === 5 || day === 6) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates.map(d => ({
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order request');
      }

      setStatus('success');
      clearCart();
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] bg-kt-champagne flex flex-col items-center justify-center p-4">
        <CheckCircle2 className="w-20 h-20 text-kt-emerald mb-6" />
        <h1 className="font-serif text-4xl font-bold text-kt-chocolate mb-4 text-center">Your Royal Decree is Received</h1>
        <p className="font-sans text-lg text-kt-chocolate/80 max-w-lg text-center mb-8">
          Thank you, {formData.name}! Your order request has been securely dispatched to our kitchen. We will review the details and contact you shortly to confirm your pickup date and arrange payment.
        </p>
        <Link href="/" className="px-8 py-4 bg-kt-chocolate text-kt-champagne font-display tracking-wider text-sm uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-kt-champagne min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/menu" className="inline-flex items-center text-kt-rouge hover:text-kt-chocolate transition-colors font-display text-xs tracking-wider uppercase mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
        </Link>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-kt-chocolate mb-12">Complete Your Request</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-kt-chocolate/10 rounded-sm">
            <p className="font-sans text-xl text-kt-chocolate/60 mb-6">Your cart is currently empty.</p>
            <Link href="/menu" className="px-8 py-4 bg-kt-rouge text-white font-display tracking-wider text-sm uppercase rounded-sm hover:bg-kt-rouge/90 transition-colors">
              Browse The Menu
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
                    <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Select Weekend Pickup Date *</label>
                    <select 
                      required
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                      className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors font-sans text-kt-chocolate"
                    >
                      <option value="" disabled>Choose a Friday or Saturday...</option>
                      {availableDates.map(date => (
                        <option key={date.value} value={date.label}>{date.label}</option>
                      ))}
                    </select>
                    <p className="mt-2 font-sans text-xs text-kt-chocolate/60">Orders must be placed by Wednesday for the upcoming weekend. Payment will be collected after confirmation.</p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="w-full py-4 mt-8 bg-kt-chocolate text-kt-champagne font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {status === 'submitting' ? 'Dispatching Decree...' : 'Submit Order Request'}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-kt-chocolate text-kt-champagne p-8 rounded-sm sticky top-24">
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
