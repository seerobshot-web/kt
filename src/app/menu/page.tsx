"use client";
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

const catalog = [
  { id: '1', category: 'Signature Puddings', name: 'Classic Banana Pudding', qty: '8 oz', price: '$10.00', desc: 'The golden crumb of our signature shortbread meets a velvety vanilla cloud.', image: '/images/banana-pudding.jpg' },
  { id: '2', category: 'Signature Puddings', name: 'Strawberry Banana Pudding', qty: '8 oz', price: '$12.00', desc: 'Fresh strawberries folded into our decadent banana and vanilla creation.', image: '/images/banana-pudding.jpg' },
  { id: '3', category: 'Signature Puddings', name: 'Cookie Butter Banana Pudding', qty: '8 oz', price: '$12.00', desc: 'A rich infusion of spiced cookie butter swirled through velvety layers.', image: '/images/banana-pudding.jpg' },
  { id: '5', category: 'Southern Pies', name: 'Sweet Potato Pie', qty: '1 pie', price: '$30.00', desc: 'Silky, spiced sweet potato filling nestled in a flaky, handcrafted butter crust.', image: '/images/banana-pudding.jpg' },
  { id: '6', category: 'Southern Pies', name: 'Sweet Potato Tarts', qty: '4 pack', price: '$10.00', desc: 'Bite-sized perfection featuring our signature sweet potato filling.', image: '/images/banana-pudding.jpg' },
  { id: '7', category: 'Southern Pies', name: 'Pecan Pie (Seasonal)', qty: '1 pie', price: '$35.00', desc: 'A royal treat of toasted pecans suspended in a rich, buttery caramel filling.', image: '/images/banana-pudding.jpg' },
  { id: '8', category: 'Cobblers', name: 'Peach Cobbler', qty: '8 oz', price: '$8.00', desc: 'Warm, spiced peaches baked under a golden, sugary crust.', image: '/images/cupcakes.jpg' },
  { id: '9', category: 'Cookies', name: 'Chocolate Chip Cookies', qty: '1 dozen', price: '$24.00', desc: 'Classic, chewy, and loaded with premium chocolate morsels.', image: '/images/cupcakes.jpg' },
  { id: '10', category: 'Cookies', name: 'Assorted Cookies', qty: '6 cookies', price: '$12.00', desc: 'A curated selection of our finest cookie offerings.', image: '/images/cupcakes.jpg' },
  { id: '11', category: 'Cookies', name: 'Standard Single Cookie', qty: '1 cookie', price: '$3.25', desc: 'A single, perfectly baked masterpiece.', image: '/images/cupcakes.jpg' },
  { id: '12', category: 'Cookies', name: 'Cookie Butter Cookie', qty: '1 cookie', price: '$4.00', desc: 'A soft, spiced cookie exploding with cookie butter flavor.', image: '/images/cupcakes.jpg' },
  { id: '13', category: 'Cookies', name: 'Oreo Crumb Cookie', qty: '1 cookie', price: '$4.99', desc: 'Rich chocolate and vanilla cream flavors baked into every bite.', image: '/images/cupcakes.jpg' },
  { id: '14', category: 'Cookies', name: 'Smores Cookie (Seasonal)', qty: '1 cookie', price: '$4.00', desc: 'Graham, chocolate, and toasted marshmallow wrapped in a cookie.', image: '/images/cupcakes.jpg' },
];

const categories = ['All', 'Signature Puddings', 'Southern Pies', 'Cobblers', 'Cookies'];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCatalog = activeCategory === 'All' 
    ? catalog 
    : catalog.filter(item => item.category === activeCategory);

  return (
    <div className="bg-kt-champagne min-h-screen pb-24">
      {/* Page Header */}
      <div className="bg-kt-chocolate text-kt-champagne py-16 text-center">
        <h1 className="font-serif text-5xl font-bold mb-4">The Royal Menu</h1>
        <p className="font-sans text-lg text-kt-champagne/80 max-w-2xl mx-auto px-4">
          Indulge in our handcrafted masterpieces. Pre-order by Wednesday for local Friday/Saturday pickup.
        </p>
      </div>

      {/* Sticky Category Tabs */}
      <div className="sticky top-20 z-40 bg-kt-champagne/95 backdrop-blur-md border-b border-kt-chocolate/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4 scrollbar-hide">
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