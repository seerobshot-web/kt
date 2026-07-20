"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create customer.');
      router.push(`/admin/customers/${data.customer.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Customer (Walk-in)</h1>
      {error && <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-sm border border-gray-200">
        <input data-testid="admin-new-customer-name" required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded" />
        <input data-testid="admin-new-customer-email" required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded" />
        <input data-testid="admin-new-customer-phone" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded" />
        <button data-testid="admin-new-customer-submit" disabled={submitting} className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-60">
          {submitting ? 'Creating...' : 'Create Customer'}
        </button>
      </form>
    </div>
  );
}
