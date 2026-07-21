import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Hanken_Grotesk, Fredoka } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kingdom Treatz | Southern Bakery in Richmond, VA",
  description: "Kingdom Treatz is a Christian-owned, small-batch Southern dessert bakery in Richmond, VA. Order online or by phone/email, up to 30 days ahead, for Friday & Saturday pickup — banana pudding, pies, cakes, and cookies made from scratch.",
  keywords: ["Richmond VA bakery", "Christian-owned bakery Richmond", "custom cakes Richmond", "banana pudding RVA", "Southern dessert bakery", "advance order cake Richmond"],
  openGraph: {
    title: "Kingdom Treatz | Southern Bakery in Richmond, VA",
    description: "Handcrafted Southern desserts, made in small batches, for Friday & Saturday pickup in Richmond, VA.",
    url: "https://kingdomtreatzrva.com",
    siteName: "Kingdom Treatz",
    locale: "en_US",
    type: "website",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  "name": "Kingdom Treatz",
  "description": "A Christian-owned, small-batch Southern dessert bakery in Richmond, VA, handcrafting banana pudding, pies, cakes, and cookies for local pickup.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Richmond",
    "addressRegion": "VA",
    "addressCountry": "US"
  },
  "areaServed": "Richmond, VA",
  "url": "https://kingdomtreatzrva.com",
  "servesCuisine": "Desserts, Southern Bakery",
  "priceRange": "$$"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${hanken.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-kt-champagne text-kt-chocolate">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
