import Link from 'next/link';

export default function Hero() {
  return (
    <section 
      className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden bg-kt-chocolate"
      style={{
        backgroundImage: 'url("/images/cookies.png")',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-kt-emerald via-kt-emerald/80 to-kt-emerald/40 z-10" />
      
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-kt-champagne mb-6 leading-tight">
          A Little Taste of Heaven, Made Just for You
        </h1>
        <p className="font-sans text-xl md:text-2xl text-kt-champagne/90 mb-10">
          Handcrafted Southern desserts, baked in small batches for Richmond families and churches
          who want it made with the same care they&apos;d give it themselves.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/menu" className="inline-flex items-center justify-center px-8 py-4 bg-kt-rouge text-white font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-rouge/90 transition-colors shadow-lg">
            Order
          </Link>
          <Link href="mailto:info@kingdomtreatzrva.com" className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-kt-champagne text-kt-champagne font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-champagne hover:text-kt-chocolate transition-colors backdrop-blur-sm">
            Email
          </Link>
        </div>
      </div>
    </section>
  );
}
