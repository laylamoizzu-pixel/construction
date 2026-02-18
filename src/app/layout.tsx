import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { getSiteConfig } from "@/app/actions/site-config";
import { DEFAULT_SITE_CONFIG } from "@/types/site-config";
import { Suspense } from "react";
import Script from "next/script";
import LanguageAssistant from "@/components/ai/LanguageAssistant";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Using Outfit as it's geometric and matches modern tech/retail logos better than Playfair
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const { branding, system } = config;

  return {
    metadataBase: new URL("https://smartavenue99.com"),
    title: {
      default: branding.siteName || "Smart Avenue 99",
      template: `%s | ${branding.siteName || "Smart Avenue 99"}`,
    },
    description: branding.tagline || "Shop the best products online.",
    icons: {
      icon: branding.faviconUrl || "/favicon.ico",
    },
    robots: system.robotsTxt ? null : {
      index: true,
      follow: true
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://smartavenue99.com",
      title: branding.siteName,
      description: branding.tagline,
      siteName: branding.siteName,
      images: [
        {
          url: branding.logoUrl || "/logo.png",
          width: 512,
          height: 512,
          alt: branding.siteName,
        },
      ],
    },
    other: {
      ...(system.scripts.googleAnalyticsId ? {} : { "google-site-verification": "P58XCY_8uZe5I7QC5eNh2wivKElDpu2ckaI60IgD5yc" })
    }
  };
}

// Optimized Layout that injects config into ClientLayout
async function ConfigLoader({ children }: { children: React.ReactNode }) {
  const siteConfig = await getSiteConfig();
  return <ClientLayout initialConfig={siteConfig}>{children}</ClientLayout>;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

  return (
    <html lang="en">
      <head>
        {config.system.scripts.customHeadScript && (
          <div dangerouslySetInnerHTML={{ __html: config.system.scripts.customHeadScript }} />
        )}
        {config.system.scripts.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${config.system.scripts.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${config.system.scripts.googleAnalyticsId}');
                    `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen`}
      >
        <Suspense fallback={<ClientLayout initialConfig={DEFAULT_SITE_CONFIG}>{children}</ClientLayout>}>
          <ConfigLoader>{children}</ConfigLoader>
        </Suspense>

        {config.system.scripts.customBodyScript && (
          <div dangerouslySetInnerHTML={{ __html: config.system.scripts.customBodyScript }} />
        )}

        <SpeedInsights />
        <LanguageAssistant />
      </body>
    </html>
  );
}
