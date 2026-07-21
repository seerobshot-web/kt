"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to log in.');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded shadow">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Kingdom Treatz Admin</h1>
        <p className="text-sm text-gray-500 mb-6">Enter the staff passcode to continue.</p>
        {error && (
          <div data-testid="admin-login-error" className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            data-testid="admin-passcode-input"
            type="password"
            required
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
          />
          <button
            data-testid="admin-login-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
