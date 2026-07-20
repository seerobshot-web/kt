import Image from 'next/image';

export default function LearnMorePage() {
  return (
    <div className="bg-kt-champagne text-kt-chocolate min-h-screen">
      {/* Brand Story */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-8">A Little Taste of Heaven</h1>
          <p className="font-sans text-lg text-kt-chocolate/80 leading-relaxed mb-6">
            Kingdom Treatz is Richmond's premier luxury small-batch bakery. We balance timeless baking traditions with modern elegance, ensuring that every treat we produce is a handcrafted masterpiece.
          </p>
          <p className="font-sans text-lg text-kt-chocolate/80 leading-relaxed">
            We believe in royal quality—never compromising on ingredients. From our velvety signature puddings to our golden artisan cakes, we are here to provide you with moments of pure, decadent indulgence.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section data-testid="mission-statement-section" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-display text-sm tracking-widest text-kt-rouge uppercase mb-4 block">Our Mission</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">Mission Statement</h2>
          <p className="font-sans text-lg text-kt-chocolate/80 leading-relaxed">
            Our mission is to honor God by using my gifts, serving others with love, and building a successful business that creates opportunities to give back to my community. I strive to live with compassion, generosity, integrity, and perseverance while creating a legacy that blesses my family and inspires others.
          </p>
        </div>
      </section>

      {/* About the Founder */}
      <section data-testid="about-founder-section" className="py-24 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-md">
            <Image
              src="/images/founder.png"
              alt="Founder of Kingdom Treatz"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-display text-sm tracking-widest text-kt-rouge uppercase mb-4 block">The Woman Behind The Crown</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">About the Founder</h2>
            <p className="font-sans text-lg text-kt-chocolate/50 italic leading-relaxed">
              [Placeholder — Founder bio and story to be provided.]
            </p>
          </div>
        </div>
      </section>

      {/* The 3-Step RVA Process */}
      <section className="py-24 bg-kt-emerald text-kt-champagne px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl font-bold text-center mb-16">The Kingdom Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 mx-auto bg-kt-rouge rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6">1</div>
              <h3 className="font-display tracking-wider uppercase text-lg mb-4">Curate Your Feast</h3>
              <p className="font-sans text-kt-champagne/80 text-sm">Browse our menu and select your handcrafted treats. All orders must be placed by Wednesday evening.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-kt-rouge rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6">2</div>
              <h3 className="font-display tracking-wider uppercase text-lg mb-4">We Bake with Care</h3>
              <p className="font-sans text-kt-champagne/80 text-sm">Our bakers prepare your order in small batches using premium ingredients, ensuring absolute freshness.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-kt-rouge rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6">3</div>
              <h3 className="font-display tracking-wider uppercase text-lg mb-4">Weekend Pickup</h3>
              <p className="font-sans text-kt-champagne/80 text-sm">Collect your order locally in Richmond, VA on Friday or Saturday and indulge in your royal escape.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold mb-4">Send a Royal Decree</h2>
          <p className="font-sans text-kt-chocolate/80">Have a question or a custom event request? We'd love to hear from you.</p>
        </div>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Name</label>
              <input type="text" className="w-full px-4 py-3 bg-white border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge" />
            </div>
            <div>
              <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Email</label>
              <input type="email" className="w-full px-4 py-3 bg-white border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge" />
            </div>
          </div>
          <div>
            <label className="block font-display text-xs tracking-wider uppercase mb-2 text-kt-chocolate/80">Message</label>
            <textarea rows={5} className="w-full px-4 py-3 bg-white border border-kt-chocolate/20 rounded-sm focus:outline-none focus:border-kt-rouge"></textarea>
          </div>
          <button type="submit" className="w-full py-4 bg-kt-chocolate text-kt-champagne font-display text-sm tracking-wider uppercase rounded-sm hover:bg-kt-chocolate/90 transition-colors">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}
