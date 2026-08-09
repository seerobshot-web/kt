"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LineItemRow {
  name: string;
  quantity: number;
  price: string; // dollars, as typed
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [rows, setRows] = useState<LineItemRow[]>([{ name: '', quantity: 1, price: '' }]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const addRow = () => setRows((prev) => [...prev, { name: '', quantity: 1, price: '' }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));
  const updateRow = (index: number, patch: Partial<LineItemRow>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const totalCents = rows.reduce((sum, row) => sum + Math.round((parseFloat(row.price) || 0) * 100) * row.quantity, 0);

  const handleSubmit = async () => {
    setStatus('submitting');
    setMessage('');
    try {
      const lineItems = rows
        .filter((row) => row.name.trim() && parseFloat(row.price) > 0)
        .map((row) => ({ name: row.name.trim(), quantity: row.quantity, priceCents: Math.round(parseFloat(row.price) * 100) }));

      if (lineItems.length === 0) throw new Error('Add at least one priced line item.');
      if (!dueDate) throw new Error('Set a due date for the invoice.');

      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name, email, phone },
          lineItems,
          dueDate,
          title: title || undefined,
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create invoice.');

      setStatus('success');
      setMessage(`Invoice sent to ${email}. Public link: ${data.invoice?.publicUrl || 'pending'}`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">New Invoice</h1>
      <p className="text-gray-500 mb-6">Price a custom order and email the customer a Square-hosted invoice to pay.</p>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-6 space-y-3">
        <h2 className="font-medium text-gray-900">Customer</h2>
        <input data-testid="admin-inv-name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
        <input data-testid="admin-inv-email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
        <input data-testid="admin-inv-phone" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="font-medium text-gray-900 mb-3">Line Items</h2>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                data-testid={`admin-inv-item-name-${i}`}
                placeholder="Item description"
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                data-testid={`admin-inv-item-qty-${i}`}
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) => updateRow(i, { quantity: Math.max(1, parseInt(e.target.value || '1', 10)) })}
                className="w-16 px-2 py-2 border border-gray-300 rounded text-sm text-right"
              />
              <input
                data-testid={`admin-inv-item-price-${i}`}
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={row.price}
                onChange={(e) => updateRow(i, { price: e.target.value })}
                className="w-24 px-2 py-2 border border-gray-300 rounded text-sm text-right"
              />
              <button type="button" onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-600 px-2">✕</button>
            </div>
          ))}
        </div>
        <button type="button" data-testid="admin-inv-add-row" onClick={addRow} className="mt-3 text-sm text-gray-600 hover:text-gray-900">+ Add item</button>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-6 space-y-3">
        <h2 className="font-medium text-gray-900">Invoice Details</h2>
        <input data-testid="admin-inv-title" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
        <textarea data-testid="admin-inv-description" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
        <div>
          <label className="block text-sm text-gray-600 mb-1">Due date</label>
          <input data-testid="admin-inv-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold">Total: ${(totalCents / 100).toFixed(2)}</span>
      </div>

      {message && (
        <div data-testid="admin-inv-message" className={`p-3 rounded text-sm mb-4 ${status === 'success' ? 'bg-green-50 border border-green-300 text-green-700' : 'bg-red-50 border border-red-300 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button data-testid="admin-inv-submit" disabled={status === 'submitting'} onClick={handleSubmit} className="flex-1 py-3 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-60">
          {status === 'submitting' ? 'Sending...' : 'Create & Send Invoice'}
        </button>
        {status === 'success' && (
          <button type="button" onClick={() => router.push('/admin')} className="px-4 py-3 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
            Done
          </button>
        )}
      </div>
    </div>
  );
}
