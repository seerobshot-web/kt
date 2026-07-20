"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OrderSummary {
  id: string;
  state: string;
  totalMoney?: { amount: number };
  fulfillments?: { pickupDetails?: { pickupAt?: string; recipient?: { displayName?: string } } }[];
}

function groupByDate(orders: OrderSummary[]) {
  const groups: Record<string, OrderSummary[]> = {};
  for (const order of orders) {
    const pickupAt = order.fulfillments?.[0]?.pickupDetails?.pickupAt;
    const key = pickupAt ? pickupAt.slice(0, 10) : 'Unscheduled';
    groups[key] = groups[key] || [];
    groups[key].push(order);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/orders?state=OPEN')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrders(data.orders || []);
      })
      .catch(() => setError('Failed to load upcoming pickups.'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming Pickups</h1>
      {error && <div data-testid="admin-dashboard-error" className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded mb-4">{error}</div>}
      {!orders && !error && <p className="text-gray-500">Loading...</p>}
      {orders && orders.length === 0 && <p className="text-gray-500">No open orders yet.</p>}
      <div className="space-y-6" data-testid="admin-dashboard-groups">
        {orders &&
          groupByDate(orders).map(([date, group]) => (
            <div key={date} className="bg-white rounded shadow-sm border border-gray-200">
              <div className="px-4 py-2 bg-gray-100 font-medium text-gray-700 rounded-t">{date}</div>
              <ul className="divide-y divide-gray-100">
                {group.map((order) => (
                  <li key={order.id} className="px-4 py-3 flex items-center justify-between text-sm">
                    <Link href={`/admin/orders/${order.id}`} className="text-gray-900 hover:underline" data-testid={`admin-dashboard-order-${order.id}`}>
                      {order.fulfillments?.[0]?.pickupDetails?.recipient?.displayName || 'Unnamed order'}
                    </Link>
                    <span className="text-gray-500">${((order.totalMoney?.amount || 0) / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
