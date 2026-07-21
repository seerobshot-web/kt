"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { catalog } from '@/lib/catalog';
import { getAvailablePickupDates } from '@/lib/pickup';
import SquareCardInput, { SquareCardInputHandle } from '@/components/admin/SquareCardInput';

export default function TakePaymentPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Every Friday/Saturday up to 30 days out, same policy as customer checkout.
  const availability = useMemo(() => getAvailablePickupDates(), []);
  const [pickupDate, setPickupDate] = useState(() => availability.options[0]?.date || '');
  const [depositOnly, setDepositOnly] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const cardRef = useRef<SquareCardInputHandle>(null);

  const pickupOption = availability.options.find((opt) => opt.date === pickupDate) || availability.options[0];

  // Date/label math is pure and instant (above); the human-readable window
  // text comes from Square's own business hours, fetched once from the server.
  const [liveWindows, setLiveWindows] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    fetch('/api/pickup-availability')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const byDay: Record<string, string> = {};
        data.options.forEach((opt: { day: string; window: string }) => { byDay[opt.day] = opt.window; });
        setLiveWindows(byDay);
      })
      .catch(() => {});
  }, []);
  const windowLabel = pickupOption ? (liveWindows ? liveWindows[pickupOption.day] : pickupOption.window) : '';

  const items = useMemo(
    () => Object.entries(quantities).filter(([, qty]) => qty > 0).map(([id, quantity]) => ({ id, quantity })),
    [quantities]
  );
  const subtotalCents = items.reduce((sum, item) => {
    const catalogItem = catalog.find((c) => c.id === item.id);
    return sum + (catalogItem?.priceCents || 0) * item.quantity;
  }, 0);
  const chargeCents = depositOnly ? Math.round(subtotalCents / 2) : subtotalCents;

  const setQty = (id: string, qty: number) => setQuantities((prev) => ({ ...prev, [id]: Math.max(0, qty) }));

  const handleSubmit = async () => {
    setStatus('submitting');
    setMessage('');
    try {
      if (items.length === 0) throw new Error('Add at least one item.');
      if (!pickupOption) throw new Error('Select a pickup date.');
      const sourceId = await cardRef.current!.tokenize();
      const res = await fetch('/api/admin/take-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name, email, phone, pickupDate: pickupOption.date, pickupDay: pickupOption.day },
          items,
          sourceId,
          depositOnly,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Charge failed.');
      setStatus('success');
      setMessage(`Charged $${(data.amountChargedCents / 100).toFixed(2)}. Order ${data.orderId}.`);
      setQuantities({});
      setName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Take Payment</h1>
      <p className="text-gray-500 mb-6">Virtual terminal for phone/in-person orders.</p>

      {availability.cutoffPassed && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded">
          This week&apos;s ordering window has closed — this order is for the following weekend.
        </div>
      )}

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-6 space-y-3">
        <h2 className="font-medium text-gray-900">Customer</h2>
        <input data-testid="admin-tp-name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
        <input data-testid="admin-tp-email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
        <input data-testid="admin-tp-phone" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="font-medium text-gray-900 mb-3">Items</h2>
        <ul className="divide-y divide-gray-100 text-sm">
          {catalog.map((item) => (
            <li key={item.id} className="py-2 flex items-center justify-between">
              <span>{item.name} <span className="text-gray-400">({item.priceDisplay})</span></span>
              <input
                data-testid={`admin-tp-qty-${item.id}`}
                type="number"
                min={0}
                value={quantities[item.id] || 0}
                onChange={(e) => setQty(item.id, parseInt(e.target.value || '0', 10))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-6 space-y-3">
        <h2 className="font-medium text-gray-900">Pickup</h2>
        <select data-testid="admin-tp-pickup-day" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
          {availability.options.map((opt) => (
            <option key={opt.date} value={opt.date}>{opt.day === 'friday' ? 'Friday' : 'Saturday'} — {opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400">Window: {windowLabel}</p>
        <p className="text-xs text-gray-400">Bookable up to 30 days ahead — pick any listed date.</p>
        <label className="flex items-center gap-2 text-sm">
          <input data-testid="admin-tp-deposit-checkbox" type="checkbox" checked={depositOnly} onChange={(e) => setDepositOnly(e.target.checked)} />
          Collect 50% deposit only (balance due at pickup)
        </label>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="font-medium text-gray-900 mb-3">Card</h2>
        <SquareCardInput ref={cardRef} containerId="take-payment-card" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold">Charging now: ${(chargeCents / 100).toFixed(2)} <span className="text-sm text-gray-400">of ${(subtotalCents / 100).toFixed(2)} total</span></span>
      </div>

      {message && (
        <div data-testid="admin-tp-message" className={`p-3 rounded text-sm mb-4 ${status === 'success' ? 'bg-green-50 border border-green-300 text-green-700' : 'bg-red-50 border border-red-300 text-red-700'}`}>
          {message}
        </div>
      )}

      <button data-testid="admin-tp-submit" disabled={status === 'submitting'} onClick={handleSubmit} className="w-full py-3 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-60">
        {status === 'submitting' ? 'Charging...' : `Charge $${(chargeCents / 100).toFixed(2)}`}
      </button>
    </div>
  );
}
