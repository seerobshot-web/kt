"use client";
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/account');
    } catch (err: any) {
      setError(err?.message || 'Unable to log in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-kt-champagne">
      <div className="w-full max-w-md bg-white p-8 rounded-sm shadow-sm border border-kt-chocolate/5">
        <h1 className="font-serif text-3xl font-bold text-kt-chocolate mb-2">Welcome Back</h1>
        <p className="font-sans text-sm text-kt-chocolate/60 mb-8">Log in to your Kingdom Treatz account.</p>

        {error && (
          <div data-testid="login-error" className="mb-6 p-4 bg-kt-rouge/10 border border-kt-rouge text-kt-rouge rounded-sm font-sans text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Email</label>
            <input
              data-testid="login-email-input"
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
              data-testid="login-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-kt-champagne/50 border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge focus:bg-white transition-colors"
            />
          </div>
          <button
            data-testid="login-submit-button"
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-kt-chocolate text-kt-champagne font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center font-sans text-sm text-kt-chocolate/60">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-kt-rouge hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
