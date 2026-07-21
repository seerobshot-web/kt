"use client";

import { useCartStore } from '@/store/cartStore';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-kt-chocolate/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-kt-champagne shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="px-6 py-6 border-b border-kt-chocolate/10 flex items-center justify-between bg-kt-champagne">
          <h2 className="font-serif text-2xl font-bold text-kt-chocolate flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart
          </h2>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-2 text-kt-chocolate/60 hover:text-kt-rouge transition-colors rounded-full hover:bg-kt-chocolate/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-kt-chocolate/50 space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p className="font-sans text-lg">Your cart is currently empty.</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-kt-rouge font-display text-sm tracking-wider uppercase border-b border-kt-rouge pb-1"
              >
                Browse
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 pb-6 border-b border-kt-chocolate/5 last:border-0 last:pb-0">
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-kt-chocolate text-lg">{item.name}</h3>
                  <p className="font-sans text-sm text-kt-chocolate/60 mb-2">{item.qtyDescription} · ${item.price.toFixed(2)} each</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-kt-chocolate/20 rounded-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-kt-chocolate/60 hover:text-kt-rouge hover:bg-kt-chocolate/5 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-sans text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-kt-chocolate/60 hover:text-kt-emerald hover:bg-kt-chocolate/5 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-display tracking-wider uppercase text-kt-chocolate/40 hover:text-kt-rouge transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="font-sans font-bold text-kt-chocolate">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-kt-chocolate/10 bg-white/50 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <span className="font-sans text-kt-chocolate/80">Subtotal</span>
              <span className="font-serif font-bold text-2xl text-kt-chocolate">${subtotal.toFixed(2)}</span>
            </div>
            <p className="font-sans text-xs text-kt-chocolate/50 mb-4 text-center">
              Book pickup up to 30 days ahead. Your card is charged securely at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => setDrawerOpen(false)}
              className="block w-full py-4 bg-kt-chocolate text-kt-champagne text-center font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
