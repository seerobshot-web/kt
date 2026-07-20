"use client";
import { Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: string;
  desc?: string;
  qty?: string;
  image?: string;
}

export default function ProductCard({ id, name, category, price, desc, qty, image }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    addItem({
      id,
      name,
      price: numericPrice,
      qtyDescription: qty || '1 item'
    });
  };
  return (
    <div className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-kt-chocolate/5">
      <div className="aspect-[4/3] bg-kt-chocolate/5 relative overflow-hidden">
        {image ? (
          <Image 
            src={image} 
            alt={name} 
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-kt-chocolate/20 font-display text-sm tracking-wider">
            IMAGE PLACEHOLDER
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="font-display text-[10px] text-kt-rouge tracking-wider uppercase block">{category}</span>
          {qty && <span className="font-sans text-xs text-kt-chocolate/60 bg-kt-champagne px-2 py-0.5 rounded-sm">{qty}</span>}
        </div>
        <h3 className="font-serif text-xl font-bold mb-2">{name}</h3>
        {desc && <p className="font-sans text-kt-chocolate/70 mb-6 text-sm flex-grow line-clamp-2">{desc}</p>}
        <div className="flex items-center justify-between pt-4 border-t border-kt-chocolate/10 mt-auto">
          <span className="font-sans font-bold text-lg text-kt-chocolate">{price}</span>
          <button 
            onClick={handleAddToCart}
            className="text-kt-emerald hover:text-white hover:bg-kt-emerald border border-kt-emerald transition-colors flex items-center justify-center p-2 rounded-sm" 
            aria-label={`Add ${name} to cart`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
