import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Seasonal Specials | Kingdom Treatz — Richmond, VA Bakery",
  description: "Limited-batch seasonal desserts from Kingdom Treatz, a small-batch Southern bakery in Richmond, VA. Order online or by phone/email for weekend pickup.",
  keywords: ["seasonal desserts Richmond", "pecan pie Richmond VA", "limited batch bakery RVA"],
  openGraph: {
    title: "Seasonal Specials | Kingdom Treatz",
    description: "Limited-batch seasonal desserts, handmade in Richmond, VA.",
    url: "https://kingdomtreatzrva.com/specials",
  },
};

export default function SpecialsPage() {
  return (
    <div className="bg-kt-chocolate text-kt-champagne min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-kt-chocolate to-kt-emerald/20 opacity-50 z-0" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="font-display text-sm tracking-widest text-kt-blush uppercase mb-4 block">For a Season Only</span>
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">This Season&apos;s Specials</h1>
        <p className="font-sans text-xl text-kt-champagne/80 mb-10">
          A short list of desserts we&apos;re only baking for a season. Once they&apos;re gone, they&apos;re gone &mdash;
          leave your email and we&apos;ll let you know before they are.
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
            Keep Me Posted
          </button>
        </form>

        {/* Current Specials Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
            <h3 className="font-serif text-2xl font-bold mb-2">Seasonal Pecan Pie</h3>
            <p className="font-sans text-kt-champagne/70 mb-4 text-sm">Toasted pecans suspended in a rich, buttery caramel filling, in a flaky handmade crust.</p>
            <div className="flex justify-between items-center">
              <span className="font-sans font-bold">$35.00</span>
              <Link href="/menu" className="text-kt-blush font-display text-xs tracking-wider uppercase hover:text-white transition-colors">Order Online</Link>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
            <h3 className="font-serif text-2xl font-bold mb-2">Smores Cookie</h3>
            <p className="font-sans text-kt-champagne/70 mb-4 text-sm">Graham, chocolate, and toasted marshmallow wrapped in a golden cookie.</p>
            <div className="flex justify-between items-center">
              <span className="font-sans font-bold">$4.00</span>
              <Link href="/menu" className="text-kt-blush font-display text-xs tracking-wider uppercase hover:text-white transition-colors">Order Online</Link>
            </div>
          </div>
        </div>

        <p className="relative z-10 mt-12 font-sans text-sm text-kt-champagne/60">
          Prefer to order by phone or email instead?{' '}
          <a href="mailto:info@kingdomtreatzrva.com" className="text-kt-blush hover:text-white transition-colors">Reach out here</a>.
        </p>
      </div>
    </div>
  );
}
