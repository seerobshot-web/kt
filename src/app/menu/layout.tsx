import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Order Online | Kingdom Treatz — Richmond, VA Bakery",
  description: "Order handcrafted Southern desserts online from Kingdom Treatz — banana pudding, pies, cakes, and cookies made in small batches for Friday & Saturday pickup in Richmond, VA.",
  keywords: ["order desserts online Richmond", "banana pudding delivery Richmond VA", "bakery pickup RVA", "Southern desserts online"],
  openGraph: {
    title: "Order Online | Kingdom Treatz",
    description: "Handcrafted Southern desserts, ordered online, picked up in Richmond, VA.",
    url: "https://kingdomtreatzrva.com/menu",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
