"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import SquareCardInput, { SquareCardInputHandle } from '@/components/admin/SquareCardInput';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const cardRef = useRef<SquareCardInputHandle>(null);
  const [collecting, setCollecting] = useState(false);

  const load = () => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((d) => (d.error ? setError(d.error) : setOrder(d.order)))
      .catch(() => setError('Failed to load order.'));
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (state: 'COMPLETED' | 'CANCELED') => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const collectBalance = async () => {
    setError('');
    setCollecting(true);
    try {
      const sourceId = await cardRef.current!.tokenize();
      const res = await fetch(`/api/admin/orders/${id}/collect-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCollecting(false);
    }
  };

  const issueRefund = async () => {
    setError('');
    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: refundPaymentId, amountCents: Math.round(parseFloat(refundAmount) * 100) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Refund issued.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error && !order) return <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded">{error}</div>;
  if (!order) return <p className="text-gray-500">Loading...</p>;

  const recipient = order.fulfillments?.[0]?.pickupDetails?.recipient;
  const total = (order.totalMoney?.amount || 0) / 100;
  const metadataTotal = order.metadata?.totalCents ? Number(order.metadata.totalCents) : total * 100;
  const balancePaidCents = order.metadata?.balancePaidCents ? Number(order.metadata.balancePaidCents) : metadataTotal;
  const due = Math.max(0, metadataTotal - balancePaidCents) / 100;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Order {order.id.slice(0, 8)}</h1>
      <p className="text-gray-500 mb-6">{recipient?.displayName} · {recipient?.emailAddress} · state: {order.state}</p>

      {error && <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded mb-4">{error}</div>}

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="font-medium text-gray-900 mb-2">Line Items</h2>
        <ul className="text-sm divide-y divide-gray-100">
          {order.lineItems?.map((li: any, idx: number) => (
            <li key={idx} className="py-2 flex justify-between">
              <span>{li.quantity} x {li.name}</span>
              <span>${((Number(li.totalMoney?.amount) || 0) / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between text-sm font-medium">
          <span>Total: ${total.toFixed(2)}</span>
          <span className={due > 0 ? 'text-red-600' : 'text-green-600'}>Balance due: ${due.toFixed(2)}</span>
        </div>
        {order.fulfillments?.[0]?.pickupDetails?.note && (
          <p className="mt-2 text-xs text-gray-400">{order.fulfillments[0].pickupDetails.note}</p>
        )}
      </div>

      <div className="flex gap-3 mb-8">
        <button data-testid="admin-order-mark-fulfilled" disabled={busy} onClick={() => updateStatus('COMPLETED')} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60">
          Mark Fulfilled
        </button>
        <button data-testid="admin-order-mark-canceled" disabled={busy} onClick={() => updateStatus('CANCELED')} className="px-4 py-2 border border-red-400 text-red-600 rounded text-sm hover:bg-red-50 disabled:opacity-60">
          Cancel Order
        </button>
      </div>

      {due > 0 && (
        <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-8">
          <h2 className="font-medium text-gray-900 mb-3">Collect Remaining Balance (${due.toFixed(2)})</h2>
          <SquareCardInput ref={cardRef} containerId="collect-balance-card" />
          <button data-testid="admin-collect-balance-button" disabled={collecting} onClick={collectBalance} className="mt-3 px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-60">
            {collecting ? 'Charging...' : 'Charge Card'}
          </button>
        </div>
      )}

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
        <h2 className="font-medium text-gray-900 mb-3">Issue Refund</h2>
        <div className="flex gap-2">
          <input data-testid="admin-refund-payment-id" placeholder="Payment ID" value={refundPaymentId} onChange={(e) => setRefundPaymentId(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm" />
          <input data-testid="admin-refund-amount" placeholder="Amount $" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="w-28 px-3 py-2 border border-gray-300 rounded text-sm" />
          <button data-testid="admin-refund-submit" onClick={issueRefund} className="px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-700">
            Refund
          </button>
        </div>
        {order.tenders?.length > 0 && (
          <ul className="mt-3 text-xs text-gray-500 space-y-1">
            {order.tenders.map((t: any) => (
              <li key={t.id}>Payment {t.paymentId || t.id}: ${((Number(t.amountMoney?.amount) || 0) / 100).toFixed(2)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
