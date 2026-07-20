import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import Image from 'next/image';

const featuredItems = [
  { id: 1, name: 'Classic Banana Pudding', category: 'Signature Puddings', price: '$10.00', desc: 'Ripe bananas layered with crunchy vanilla wafers and topped with a generous dollop of light, airy whipped cream.', image: '/images/banana-pudding.png' },
  { id: 2, name: 'Brown Butter Pound Cake', category: 'Artisan Cakes', price: '$8.00', desc: 'A rich, buttery slice of Southern comfort with a delicate, caramelized crust.', image: '/images/cookies.png' },
  { id: 3, name: 'Sweet Potato Pie', category: 'Southern Pies', price: '$30.00', desc: 'Silky, spiced sweet potato filling nestled in a flaky, handcrafted butter crust.', image: '/images/cookies.png' },
];

export default function FeaturedGrid() {
  return (
    <section className="py-24 bg-kt-champagne text-kt-chocolate relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">The Royal Court</h2>
          <p className="font-sans text-lg text-kt-chocolate/80 max-w-2xl mx-auto">
            Discover the masterful creations that have captured the hearts of Richmond.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="aspect-square bg-kt-chocolate/10 relative overflow-hidden rounded-t-sm">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <span className="font-display text-xs text-kt-rouge tracking-wider uppercase mb-2 block">{item.category}</span>
                <h3 className="font-serif text-2xl font-bold mb-3">{item.name}</h3>
                <p className="font-sans text-kt-chocolate/80 mb-6 text-sm flex-grow">{item.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-kt-chocolate/10">
                  <span className="font-sans font-bold text-lg">{item.price}</span>
                  <Link href="/menu" className="text-kt-emerald hover:text-kt-rouge transition-colors flex items-center font-display text-sm tracking-wider uppercase">
                    Order <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}