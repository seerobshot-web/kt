import Image from 'next/image';

const IDENTITY_GRID = [
  { label: 'Rooted in Faith', detail: 'Every batch starts with a quiet thank-you.' },
  { label: 'Richmond-Raised', detail: 'Baking for the city that raised her.' },
  { label: 'Small-Batch, By Hand', detail: 'No shortcuts, no assembly line.' },
  { label: 'Made New', detail: 'What’s been refined still gets to rise.' },
];

export default function FounderProfile() {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
      {/* Oval Photo Frame */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-sm aspect-[4/5] rounded-[50%] overflow-hidden shadow-lg ring-4 ring-kt-gold/40 ring-offset-4 ring-offset-kt-champagne">
          <Image
            src="/images/founder.png"
            alt="Founder of Kingdom Treatz, Richmond VA"
            fill
            className="object-cover object-top scale-125"
          />
        </div>
      </div>

      {/* Bio + Profile Style Grid */}
      <div>
        <span className="font-display text-sm tracking-widest text-kt-rouge uppercase mb-4 block">The Woman Behind The Crown</span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">About the Founder</h2>

        <div className="space-y-4 font-sans text-lg text-kt-chocolate/80 leading-relaxed mb-10">
          <p>
            Every recipe in this kitchen has been through the oven more than once. Kingdom Treatz
            began the way most good things do &mdash; not from ease, but from a season that asked
            for more patience than felt fair. Baking became a quiet place to land: a bowl, a whisk,
            a little sugar and butter turned into something whole.
          </p>
          <p>
            There&apos;s a kind of grace in taking what&apos;s plain and letting it rise into
            something worth sharing. That&apos;s the heart behind every treat that leaves this
            kitchen &mdash; proof that what&apos;s been through the fire can still come out sweet.
            A warm dessert, handed to someone who needed it, is still one of the simplest ways to
            say you&apos;re loved. Every order from Kingdom Treatz is a small piece of that.
          </p>
        </div>

        {/* Profile Style Grid */}
        <div className="grid grid-cols-2 gap-4">
          {IDENTITY_GRID.map((item) => (
            <div key={item.label} className="bg-white border border-kt-chocolate/10 rounded-sm p-4">
              <p className="font-display text-xs tracking-wider uppercase text-kt-emerald mb-1">{item.label}</p>
              <p className="font-sans text-sm text-kt-chocolate/70">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
