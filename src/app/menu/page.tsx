"use client";
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

const catalog = [
  { id: '1', category: 'Signature Puddings', name: 'Classic Banana Pudding', qty: '8 oz', price: '$10.00', desc: 'Ripe bananas layered with crunchy vanilla wafers and topped with a generous dollop of light, airy whipped cream.', image: '/images/banana-pudding.png' },
  { id: '2', category: 'Signature Puddings', name: 'Strawberry Banana Pudding', qty: '8 oz', price: '$12.00', desc: 'Layers of ripe strawberries and sweet bananas folded into a rich, creamy pudding, creating a delightful blend of fruity flavors and smooth texture.', image: '/images/strawberry-banana-pudding.png' },
  { id: '3', category: 'Signature Puddings', name: 'Cookie Butter Banana Pudding', qty: '8 oz', price: '$12.00', desc: 'A rich infusion of spiced cookie butter swirled through velvety layers.', image: '/images/banana-pudding.png' },
  { id: '4', category: 'Artisan Cakes', name: 'Brown Butter Pound Cake', qty: '1 slice', price: '$8.00', desc: 'A rich, buttery slice of Southern comfort with a delicate, caramelized crust.', image: '/images/cookies.png' },
  { id: '5', category: 'Southern Pies', name: 'Sweet Potato Pie', qty: '1 pie', price: '$30.00', desc: 'Silky, spiced sweet potato filling nestled in a flaky, handcrafted butter crust.', image: '/images/cookies.png' },
  { id: '6', category: 'Southern Pies', name: 'Sweet Potato Tarts', qty: '4 pack', price: '$10.00', desc: 'Bite-sized perfection featuring our signature sweet potato filling.', image: '/images/cookies.png' },
  { id: '7', category: 'Southern Pies', name: 'Pecan Pie (Seasonal)', qty: '1 pie', price: '$35.00', desc: 'A royal treat of toasted pecans suspended in a rich, buttery caramel filling.', image: '/images/cookies.png' },
  { id: '8', category: 'Cobblers', name: 'Peach Cobbler', qty: '8 oz', price: '$8.00', desc: 'Warm, spiced peaches baked under a golden, sugary crust.', image: '/images/cookies.png' },
  { id: '9', category: 'Cookies', name: 'Chocolate Chip Cookies', qty: '1 dozen', price: '$24.00', desc: 'Classic, chewy, and loaded with premium chocolate morsels.', image: '/images/cookies.png' },
  { id: '10', category: 'Cookies', name: 'Assorted Cookies', qty: '6 cookies', price: '$12.00', desc: 'A curated selection of our finest cookie offerings.', image: '/images/cookies.png' },
  { id: '11', category: 'Cookies', name: 'Standard Single Cookie', qty: '1 cookie', price: '$3.25', desc: 'A single, perfectly baked masterpiece.', image: '/images/cookies.png' },
  { id: '12', category: 'Cookies', name: 'Cookie Butter Cookie', qty: '1 cookie', price: '$4.00', desc: 'A soft, spiced cookie exploding with cookie butter flavor.', image: '/images/cookies.png' },
  { id: '13', category: 'Cookies', name: 'Oreo Crumb Cookie', qty: '1 cookie', price: '$4.99', desc: 'Rich chocolate and vanilla cream flavors baked into every bite.', image: '/images/cookies.png' },
  { id: '14', category: 'Cookies', name: 'Smores Cookie (Seasonal)', qty: '1 cookie', price: '$4.00', desc: 'Graham, chocolate, and toasted marshmallow wrapped in a cookie.', image: '/images/cookies.png' },
];

const categories = ['All', 'Signature Puddings', 'Artisan Cakes', 'Southern Pies', 'Cobblers', 'Cookies'];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCatalog = activeCategory === 'All' 
    ? catalog 
    : catalog.filter(item => item.category === activeCategory);

  return (
    <div className="bg-kt-champagne min-h-screen pb-24">
      {/* Page Header */}
      <div className="bg-kt-chocolate text-kt-champagne py-16 text-center">
        <h1 className="font-serif text-5xl font-bold mb-4">Order Online</h1>
        <p className="font-sans text-lg text-kt-champagne/80 max-w-2xl mx-auto px-4">
          Handcrafted, small-batch Southern desserts for local Richmond pickup. Book any Friday or
          Saturday up to 30 days out &mdash; ideal for weddings, showers, and church events planned
          ahead. Orders for the nearest weekend close each Wednesday at 9:00 PM, or reach us by{' '}
          <a href="mailto:info@kingdomtreatzrva.com" className="text-kt-blush hover:text-kt-champagne underline transition-colors">email</a>{' '}
          if you&apos;d rather place your order that way.
        </p>
      </div>

      {/* Sticky Category Tabs */}
      <div className="sticky top-16 md:top-36 z-40 bg-kt-champagne/95 backdrop-blur-md border-b border-kt-chocolate/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 md:gap-8 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap font-display text-sm tracking-wider uppercase pb-1 border-b-2 transition-colors ${activeCategory === cat ? 'border-kt-rouge text-kt-chocolate' : 'border-transparent text-kt-chocolate/60 hover:text-kt-rouge'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {filteredCatalog.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCatalog.map((item) => (
              <ProductCard 
                key={item.id}
                id={item.id}
                name={item.name}
                category={item.category}
                price={item.price}
                qty={item.qty}
                desc={item.desc}
                image={item.image}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-sans text-kt-chocolate/60 text-xl">We are currently crafting new items for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}