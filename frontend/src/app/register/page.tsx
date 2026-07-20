"use client";
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      router.push('/account');
    } catch (err: any) {
      setError(err?.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-kt-champagne">
      <div className="w-full max-w-md bg-white p-8 rounded-sm shadow-sm border border-kt-chocolate/5">
        <h1 className="font-serif text-3xl font-bold text-kt-chocolate mb-2">Join the Royal Court</h1>
        <p className="font-sans text-sm text-kt-chocolate/60 mb-8">Create your Kingdom Treatz account.</p>

        {error && (
          <div data-testid="register-error" className="mb-6 p-4 bg-kt-rouge/10 border border-kt-rouge text-kt-rouge rounded-sm font-sans text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Full Name</label>
            <input
              data-testid="register-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Email</label>
            <input
              data-testid="register-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Password</label>
            <input
              data-testid="register-password-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors"
            />
            <p className="mt-2 font-sans text-xs text-kt-chocolate/50">At least 8 characters.</p>
          </div>
          <button
            data-testid="register-submit-button"
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-kt-chocolate text-kt-champagne font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center font-sans text-sm text-kt-chocolate/60">
          Already have an account?{' '}
          <Link href="/login" className="text-kt-rouge hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
