"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((res) => res.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError('Failed to load customer.'));
  }, [id]);

  const archive = async () => {
    if (!confirm('Archive this customer? This cannot be undone in Square.')) return;
    const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/customers');
  };

  if (error) return <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded">{error}</div>;
  if (!data) return <p className="text-gray-500">Loading...</p>;

  const c = data.customer;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">{c.givenName} {c.familyName}</h1>
      <p className="text-gray-500 mb-6">{c.emailAddress} · {c.phoneNumber || 'no phone on file'}</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
          <div className="text-xs uppercase text-gray-400 mb-1">Last Order</div>
          {data.lastOrder ? (
            <Link href={`/admin/orders/${data.lastOrder.id}`} className="text-gray-900 hover:underline text-sm">
              {data.lastOrder.fulfillments?.[0]?.pickupDetails?.pickupAt?.slice(0, 10) || data.lastOrder.id}
            </Link>
          ) : (
            <span className="text-gray-400 text-sm">None yet</span>
          )}
        </div>
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
          <div className="text-xs uppercase text-gray-400 mb-1">Next Order</div>
          {data.nextOrder ? (
            <Link href={`/admin/orders/${data.nextOrder.id}`} className="text-gray-900 hover:underline text-sm">
              {data.nextOrder.fulfillments?.[0]?.pickupDetails?.pickupAt?.slice(0, 10) || data.nextOrder.id}
            </Link>
          ) : (
            <span className="text-gray-400 text-sm">None scheduled</span>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Transaction History</h2>
      <div className="bg-white rounded shadow-sm border border-gray-200 divide-y divide-gray-100" data-testid="admin-customer-orders-list">
        {data.orders.length === 0 && <div className="px-4 py-6 text-center text-gray-500">No orders yet.</div>}
        {data.orders.map((o: any) => {
          const total = (o.totalMoney?.amount || 0) / 100;
          const metadataTotalCents = o.metadata?.totalCents ? Number(o.metadata.totalCents) : total * 100;
          const balancePaidCents = o.metadata?.balancePaidCents ? Number(o.metadata.balancePaidCents) : metadataTotalCents;
          const due = Math.max(0, metadataTotalCents - balancePaidCents) / 100;
          return (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block px-4 py-3 hover:bg-gray-50 text-sm flex items-center justify-between">
              <span>{o.fulfillments?.[0]?.pickupDetails?.pickupAt?.slice(0, 10) || o.id} · {o.state}</span>
              <span>${total.toFixed(2)} paid ${(total - due).toFixed(2)}{due > 0 && <span className="text-red-600"> · ${due.toFixed(2)} due</span>}</span>
            </Link>
          );
        })}
      </div>

      <button data-testid="admin-archive-customer-button" onClick={archive} className="mt-8 px-4 py-2 border border-red-400 text-red-600 rounded text-sm hover:bg-red-50">
        Archive Customer
      </button>
    </div>
  );
}
