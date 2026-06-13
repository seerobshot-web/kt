import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-kt-chocolate text-kt-champagne border-t border-kt-champagne/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Story */}
          <div className="space-y-4">
            <h3 className="font-serif text-3xl font-bold">Kingdom Treatz</h3>
            <p className="font-sans text-kt-champagne/80 max-w-sm">
              A Little Taste of Heaven. Richmond's premier luxury small-batch bakery. Every treat is a handcrafted masterpiece.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display tracking-wider text-sm mb-6 text-kt-blush">EXPLORE</h4>
            <ul className="space-y-3 font-sans">
              <li><Link href="/" className="hover:text-kt-rouge transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-kt-rouge transition-colors">The Menu</Link></li>
              <li><Link href="/specials" className="hover:text-kt-rouge transition-colors">Seasonal Specials</Link></li>
              <li><Link href="/learn-more" className="hover:text-kt-rouge transition-colors">Learn More</Link></li>
            </ul>
          </div>

          {/* SEO NAP (Name, Address, Phone) */}
          <div>
            <h4 className="font-display tracking-wider text-sm mb-6 text-kt-blush">VISIT US IN RVA</h4>
            <div className="space-y-3 font-sans text-kt-champagne/80">
              <p>
                <strong>Kingdom Treatz Bakery</strong><br/>
                Richmond, VA 23223<br/>
                (Local Pickup Only - Fridays & Saturdays)
              </p>
              <p className="pt-4">
                <a href="mailto:info@kingdomtreatzrva.com" className="hover:text-kt-rouge transition-colors">info@kingdomtreatzrva.com</a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-kt-champagne/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-sans text-kt-champagne/60">
          <p>&copy; {new Date().getFullYear()} Kingdom Treatz Bakery. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="#" className="hover:text-kt-rouge transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-kt-rouge transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
