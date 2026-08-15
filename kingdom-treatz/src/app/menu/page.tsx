"use client";

import { useState } from "react";

const categories = [
  { id: "cakes", name: "Cakes" },
  { id: "cupcakes", name: "Cupcakes" },
  { id: "cookies", name: "Cookies" },
  { id: "pastries", name: "Pastries" },
  { id: "beverages", name: "Beverages" },
];

const products = [
  { id: "1", category: "cakes", name: "Royal Chocolate Cake", price: 45, desc: "Rich triple-layer chocolate ganache." },
  { id: "2", category: "cakes", name: "Champagne Velvet", price: 48, desc: "Red velvet with champagne buttercream." },
  { id: "3", category: "cupcakes", name: "Crown Cupcakes (6)", price: 18, desc: "Assorted gourmet cupcakes." },
  { id: "4", category: "cookies", name: "Golden Butter Cookies", price: 12, desc: "Melt-in-your-mouth shortbread." },
  { id: "5", category: "pastries", name: "Palace Croissant", price: 6, desc: "Flaky all-butter croissant." },
  { id: "6", category: "beverages", name: "Majesty Mocha", price: 5, desc: "House blend with cocoa." },
];

export default function MenuPage() {
  const [active, setActive] = useState(categories[0].id);
  const filtered = products.filter((p) => p.category === active);

  return (
    <main className="min-h-screen bg-kt-champagne text-kt-chocolate">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center">
        <h1 className="text-4xl md:text-6xl font-serif">Our Menu</h1>
        <p className="mt-3 text-kt-chocolate/70">Handcrafted treats fit for royalty.</p>
      </section>

      {/* Sticky category bar — offset matches the responsive header height */}
      <div className="sticky top-16 md:top-36 z-40 bg-kt-champagne/95 backdrop-blur border-b border-kt-chocolate/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tighter gaps on mobile so tabs don't overflow awkwardly */}
          <div className="flex gap-4 md:gap-8 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`whitespace-nowrap text-lg font-medium transition-colors ${
                  active === cat.id
                    ? "text-kt-chocolate border-b-2 border-kt-chocolate"
                    : "text-kt-chocolate/50 hover:text-kt-chocolate"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-sm bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-kt-chocolate/70">{p.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">${p.price.toFixed(2)}</span>
                <button className="rounded-sm bg-kt-chocolate px-4 py-2 text-sm font-semibold text-kt-champagne hover:opacity-90">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
