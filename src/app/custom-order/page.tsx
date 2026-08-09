"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CustomOrderPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    neededByDate: '',
    description: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/custom-order-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.error || 'Could not send your request.');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] bg-kt-champagne flex flex-col items-center justify-center p-4">
        <CheckCircle2 className="w-20 h-20 text-kt-emerald mb-6" />
        <h1 className="font-serif text-4xl font-bold text-kt-chocolate mb-4 text-center">Request Received</h1>
        <p className="font-sans text-lg text-kt-chocolate/80 max-w-lg text-center mb-8">
          Thanks, {formData.name}! We&apos;ll review your custom order and follow up by email with pricing and a link to pay.
        </p>
        <Link href="/" className="px-8 py-4 bg-kt-chocolate text-kt-champagne font-display tracking-wider text-sm uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-kt-champagne min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/menu" className="inline-flex items-center text-kt-rouge hover:text-kt-chocolate transition-colors font-display text-xs tracking-wider uppercase mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Menu
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-kt-chocolate mb-4">Request a Custom Order</h1>
        <p className="font-sans text-kt-chocolate/70 mb-12">
          Planning something special — a bespoke cake, a large event order? Tell us what you have in mind and we&apos;ll follow up with pricing and a secure link to pay once the details are set.
        </p>

        <div className="bg-white p-8 rounded-sm shadow-sm border border-kt-chocolate/5">
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Needed By *</label>
              <input
                type="date"
                required
                value={formData.neededByDate}
                onChange={(e) => setFormData({ ...formData, neededByDate: e.target.value })}
                className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Tell Us What You Need *</label>
              <textarea
                required
                minLength={10}
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Occasion, flavors, serving size, design ideas, budget range..."
                className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-4 mt-4 bg-kt-chocolate text-kt-champagne font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
