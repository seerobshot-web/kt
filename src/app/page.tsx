import Hero from "@/components/Hero";
import FeaturedGrid from "@/components/FeaturedGrid";
import TestimonialSlider from "@/components/TestimonialSlider";

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <FeaturedGrid />
      <TestimonialSlider />
    </div>
  );
}
