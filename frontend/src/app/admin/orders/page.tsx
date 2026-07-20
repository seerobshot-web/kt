"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then((d) => (d.error ? setError(d.error) : setOrders(d.orders || [])))
      .catch(() => setError('Failed to load orders.'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">All Orders</h1>
      {error && <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded mb-4">{error}</div>}
      <div className="bg-white rounded shadow-sm border border-gray-200 divide-y divide-gray-100" data-testid="admin-orders-list">
        {orders?.map((o) => {
          const recipient = o.fulfillments?.[0]?.pickupDetails?.recipient;
          const total = (o.totalMoney?.amount || 0) / 100;
          return (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block px-4 py-3 hover:bg-gray-50 text-sm flex items-center justify-between" data-testid={`admin-order-row-${o.id}`}>
              <span>{recipient?.displayName || 'Unnamed'} · {o.fulfillments?.[0]?.pickupDetails?.pickupAt?.slice(0, 10) || 'no date'}</span>
              <span className="uppercase text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{o.state}</span>
              <span>${total.toFixed(2)}</span>
            </Link>
          );
        })}
        {orders && orders.length === 0 && <div className="px-4 py-6 text-center text-gray-500">No orders yet.</div>}
      </div>
    </div>
  );
}
