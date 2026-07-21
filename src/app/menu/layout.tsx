import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Order Online | Kingdom Treatz — Richmond, VA Bakery",
  description: "Order handcrafted Southern desserts online from Kingdom Treatz — banana pudding, pies, cakes, and cookies made in small batches. Book pickup up to 30 days ahead for weddings, showers, and church events in Richmond, VA.",
  keywords: ["order desserts online Richmond", "banana pudding Richmond VA", "bakery pickup RVA", "Southern desserts online", "advance order cake Richmond", "wedding dessert Richmond VA"],
  openGraph: {
    title: "Order Online | Kingdom Treatz",
    description: "Handcrafted Southern desserts, ordered online up to 30 days ahead, picked up in Richmond, VA.",
    url: "https://kingdomtreatzrva.com/menu",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
