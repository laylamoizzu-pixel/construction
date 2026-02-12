import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Using Outfit as it's geometric and matches modern tech/retail logos better than Playfair
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smartavnue.com"),
  title: {
    default: "Smart Avnue – All your home needs, simplified.",
    template: "%s | Smart Avnue",
  },
  description:
    "We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, durable plasticware, quality crockery, cosmetics, premium stationery, soft toys, and thoughtfully curated gift items—bringing comfort, convenience, and elegance to everyday living.",
  keywords: [
    "Smart Avnue retail store",
    "premium stationery store",
    "stylish stationery products",
    "affordable home décor store",
    "kitchen décor products",
    "soft toys shop",
    "plastic home products",
    "home essentials store",
    "premium products affordable price",
    "retail store near me",
    "gift shop",
    "online shopping",
  ],
  authors: [{ name: "Smart Avnue" }],
  creator: "Smart Avnue",
  publisher: "Smart Avnue",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartavnue.com",
    title: "Smart Avnue – All your home needs, simplified.",
    description:
      "We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, durable plasticware, quality crockery, cosmetics, premium stationery, soft toys, and thoughtfully curated gift items—bringing comfort, convenience, and elegance to everyday living.",
    siteName: "Smart Avnue",
    images: [
      {
        url: "https://smartavnue.com/logo.png",
        width: 512,
        height: 512,
        alt: "Smart Avnue Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Avnue – All your home needs, simplified.",
    description:
      "We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, durable plasticware, quality crockery, cosmetics, premium stationery, soft toys, and thoughtfully curated gift items—bringing comfort, convenience, and elegance to everyday living.",
    images: ["https://smartavnue.com/logo.png"],
    creator: "@smartavnue",
  },
  verification: {
    google: "P58XCY_8uZe5I7QC5eNh2wivKElDpu2ckaI60IgD5yc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

import { getSiteConfig } from "@/app/actions/site-config";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen`}
      >
        <ClientLayout initialConfig={siteConfig}>{children}</ClientLayout>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DepartmentStore",
              "name": "Smart Avnue",
              "url": "https://smartavnue.com",
              "logo": "https://smartavnue.com/logo.png",
              "image": "https://smartavnue.com/logo.png",
              "description": "One-stop departmental store offering home essentials, decor, kitchenware, and gifts.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "priceRange": "₹₹"
            })
          }}
        />
      </body>
    </html>
  );
}
