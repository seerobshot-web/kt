import Link from 'next/link';

export default function SpecialsPage() {
  return (
    <div className="bg-kt-chocolate text-kt-champagne min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-kt-chocolate to-kt-emerald/20 opacity-50 z-0" />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="font-display text-sm tracking-widest text-kt-blush uppercase mb-4 block">Limited Time Only</span>
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">The Seasonal Drop</h1>
        <p className="font-sans text-xl text-kt-champagne/80 mb-10">
          Our exclusive weekend specials are crafted in highly limited batches. Join the Royal Court to be notified before they vanish.
        </p>
        
        {/* Email Capture */}
        <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-16">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-grow px-6 py-4 bg-white/10 border border-kt-champagne/20 text-kt-champagne placeholder-kt-champagne/50 focus:outline-none focus:border-kt-rouge rounded-sm font-sans"
            required
          />
          <button type="submit" className="px-8 py-4 bg-kt-rouge text-white font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-rouge/90 transition-colors whitespace-nowrap">
            Join the Court
          </button>
        </form>

        {/* Current Specials Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
            <h3 className="font-serif text-2xl font-bold mb-2">Seasonal Pecan Pie</h3>
            <p className="font-sans text-kt-champagne/70 mb-4 text-sm">A royal treat of toasted pecans suspended in a rich, buttery caramel filling.</p>
            <div className="flex justify-between items-center">
              <span className="font-sans font-bold">$35.00</span>
              <Link href="/menu" className="text-kt-blush font-display text-xs tracking-wider uppercase hover:text-white transition-colors">Pre-order Now</Link>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
            <h3 className="font-serif text-2xl font-bold mb-2">Smores Cookie</h3>
            <p className="font-sans text-kt-champagne/70 mb-4 text-sm">Graham, chocolate, and toasted marshmallow wrapped in a golden cookie.</p>
            <div className="flex justify-between items-center">
              <span className="font-sans font-bold">$4.00</span>
              <Link href="/menu" className="text-kt-blush font-display text-xs tracking-wider uppercase hover:text-white transition-colors">Pre-order Now</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
