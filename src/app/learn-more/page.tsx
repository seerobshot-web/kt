import type { Metadata } from 'next';
import FounderProfile from '@/components/FounderProfile';

export const metadata: Metadata = {
  title: "Our Story & Founder | Kingdom Treatz — Richmond, VA Bakery",
  description: "Meet the founder behind Kingdom Treatz and learn how a season of hardship became a Christian-owned Richmond bakery devoted to handcrafted Southern desserts, faith, and hospitality.",
  keywords: ["Kingdom Treatz story", "Christian-owned bakery Richmond", "Richmond VA baker", "Southern dessert bakery about"],
  openGraph: {
    title: "Our Story & Founder | Kingdom Treatz",
    description: "How a season of hardship became a Richmond bakery built on faith, hospitality, and handmade Southern desserts.",
    url: "https://kingdomtreatzrva.com/learn-more",
  },
};

export default function LearnMorePage() {
  return (
    <div className="bg-kt-champagne text-kt-chocolate min-h-screen">
      {/* Brand Story */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-8">A Little Taste of Heaven</h1>
          <p className="font-sans text-lg text-kt-chocolate/80 leading-relaxed mb-6">
            Kingdom Treatz is a small-batch Southern dessert bakery in Richmond, VA, handcrafting
            every order the same way we&apos;d make it for our own table. Nothing here is mass
            produced &mdash; each pudding, pie, and cookie is made in small batches, by hand, for
            the family, church, or celebration that ordered it.
          </p>
          <p className="font-sans text-lg text-kt-chocolate/80 leading-relaxed">
            We&apos;re rooted in faith and built on relationship. Whether you order online or give
            us a call, our hope is that it feels less like a transaction and more like an invitation
            &mdash; a small, sweet moment of peace in your week.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section data-testid="mission-statement-section" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-display text-sm tracking-widest text-kt-rouge uppercase mb-4 block">Our Mission</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">Mission Statement</h2>
          <p className="font-sans text-lg text-kt-chocolate/80 leading-relaxed">
            Kingdom Treatz exists to bring a little taste of heaven to Richmond&apos;s tables &mdash;
            handcrafting Southern desserts from scratch, in small batches, for families and churches
            who want a treat made with the same care they&apos;d give it themselves. Rooted in faith
            and built on relationship, every order is a chance to slow down, share a moment of
            peace, and taste something made just for you.
          </p>
        </div>
      </section>

      {/* About the Founder */}
      <section data-testid="about-founder-section" className="py-24 px-4">
        <FounderProfile />
      </section>

      {/* The 3-Step RVA Process */}
      <section className="py-24 bg-kt-emerald text-kt-champagne px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl font-bold text-center mb-4">How an Order Comes Together</h2>
          <p className="font-sans text-center text-kt-champagne/70 max-w-2xl mx-auto mb-16">
            Order online, or give us a call or email &mdash; either way, here&apos;s what happens next.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 mx-auto bg-kt-rouge rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6">1</div>
              <h3 className="font-display tracking-wider uppercase text-lg mb-4">Place Your Order</h3>
              <p className="font-sans text-kt-champagne/80 text-sm">Order online, or reach us by phone or email &mdash; whichever feels easiest. Orders close each Wednesday at 9:00 PM for that weekend&apos;s pickup.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-kt-rouge rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6">2</div>
              <h3 className="font-display tracking-wider uppercase text-lg mb-4">We Bake with Care</h3>
              <p className="font-sans text-kt-champagne/80 text-sm">Your order is prepared by hand, in a small batch, with the same ingredients and attention we&apos;d want on our own table.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-kt-rouge rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6">3</div>
              <h3 className="font-display tracking-wider uppercase text-lg mb-4">Weekend Pickup</h3>
              <p className="font-sans text-kt-champagne/80 text-sm">Collect your order locally in Richmond, VA, Friday or Saturday. We don&apos;t deliver &mdash; but we do love seeing you in person.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold mb-4">Let&apos;s Talk About Your Order</h2>
          <p className="font-sans text-kt-chocolate/80">
            Planning an event, a church gathering, or just have a question? Send a note here, or
            reach us directly at{' '}
            <a href="mailto:info@kingdomtreatzrva.com" className="text-kt-emerald hover:text-kt-rouge transition-colors">info@kingdomtreatzrva.com</a>.
            We&apos;d love to hear from you.
          </p>
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
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
