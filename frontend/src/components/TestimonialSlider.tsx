import { Star } from 'lucide-react';

export default function TestimonialSlider() {
  return (
    <section className="py-24 bg-kt-emerald text-kt-champagne">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center space-x-1 mb-8">
          {[1,2,3,4,5].map((i) => <Star key={i} className="w-6 h-6 fill-kt-champagne text-kt-champagne" />)}
        </div>
        <blockquote className="font-serif text-3xl md:text-4xl italic leading-relaxed mb-8">
          "Absolutely the most decadent banana pudding I have ever tasted. It truly was a little taste of heaven for our wedding reception!"
        </blockquote>
        <div className="font-display tracking-wider uppercase text-sm text-kt-champagne/80">
          — Sarah & James, Richmond VA
        </div>
      </div>
    </section>
  );
}
