"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  givenName?: string;
  familyName?: string;
  emailAddress?: string;
  phoneNumber?: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = (query: string) => {
    fetch(`/api/admin/customers${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCustomers(data.customers || []);
      })
      .catch(() => setError('Failed to load customers.'));
  };

  useEffect(() => {
    load('');
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <Link href="/admin/customers/new" data-testid="admin-new-customer-link" className="px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-700">
          + New Customer
        </Link>
      </div>
      <input
        data-testid="admin-customer-search-input"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          load(e.target.value);
        }}
        placeholder="Search by name, email, or phone"
        className="w-full mb-6 px-3 py-2 border border-gray-300 rounded"
      />
      {error && <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded mb-4">{error}</div>}
      <div className="bg-white rounded shadow-sm border border-gray-200 divide-y divide-gray-100" data-testid="admin-customers-list">
        {customers?.map((c) => (
          <Link
            key={c.id}
            href={`/admin/customers/${c.id}`}
            className="block px-4 py-3 hover:bg-gray-50 text-sm"
            data-testid={`admin-customer-row-${c.id}`}
          >
            <span className="font-medium text-gray-900">{c.givenName} {c.familyName}</span>
            <span className="text-gray-500 ml-3">{c.emailAddress}</span>
          </Link>
        ))}
        {customers && customers.length === 0 && <div className="px-4 py-6 text-center text-gray-500">No customers found.</div>}
      </div>
    </div>
  );
}
