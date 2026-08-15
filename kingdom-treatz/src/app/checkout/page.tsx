"use client";

import { useState } from "react";

const cart = [
  { id: "1", name: "Royal Chocolate Cake", qty: 1, price: 45 },
  { id: "3", name: "Crown Cupcakes (6)", qty: 2, price: 18 },
];

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pickupDate: "",
  });

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <main className="min-h-screen bg-kt-champagne text-kt-chocolate">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl md:text-5xl font-serif mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary — appears first on mobile, right column on desktop */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-kt-chocolate text-kt-champagne p-8 rounded-sm sticky top-24 md:top-40">
              <h2 className="text-2xl font-serif mb-6">Order Summary</h2>
              <ul className="space-y-4">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} <span className="opacity-70">x{item.qty}</span>
                    </span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="my-6 border-t border-kt-champagne/20" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer + payment form */}
          <div className="lg:col-span-2">
            <form className="bg-white rounded-sm p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-serif mb-4">Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="w-full rounded-sm border border-kt-chocolate/20 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="w-full rounded-sm border border-kt-chocolate/20 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="w-full rounded-sm border border-kt-chocolate/20 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={form.pickupDate}
                      onChange={(e) => update("pickupDate", e.target.value)}
                      className="w-full rounded-sm border border-kt-chocolate/20 px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Payment</h2>
                {/* Square Web Payments SDK card container mounts here — untouched */}
                <div id="card-container" className="rounded-sm border border-kt-chocolate/20 p-4 min-h-[56px]" />
              </div>

              <button
                type="submit"
                className="w-full rounded-sm bg-kt-chocolate px-6 py-3 font-semibold text-kt-champagne hover:opacity-90"
              >
                Place Order — ${total.toFixed(2)}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
