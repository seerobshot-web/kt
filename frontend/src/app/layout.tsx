import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Hanken_Grotesk, Fredoka } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { AuthProvider } from "@/context/AuthContext";

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
  title: "Kingdom Treatz | Premium Custom Cakes & Desserts in Richmond, VA",
  description: "Order luxury, small-batch desserts from Kingdom Treatz in Richmond, VA. Custom cakes, famous banana pudding, and cookies available for Friday & Saturday pickup.",
  keywords: ["Richmond VA bakery", "custom cakes Richmond", "banana pudding RVA", "luxury desserts Richmond"],
  openGraph: {
    title: "Kingdom Treatz | Richmond's Premium Bakery",
    description: "Order luxury, small-batch desserts for weekend pickup.",
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
  "description": "Richmond's premier luxury small-batch bakery specializing in custom cakes, signature banana pudding, and cookies.",
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
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}
