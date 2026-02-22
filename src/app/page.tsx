import Hero from "@/components/Hero";
import dynamic from "next/dynamic";
import { getSiteContent, FeaturesContent, CTAContent, HighlightsContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import { Suspense } from "react";

// Lazy-load below-the-fold components
const Highlights = dynamic(() => import("@/components/Highlights"));
const Features = dynamic(() => import("@/components/Features"));
const CTA = dynamic(() => import("@/components/CTA"));
const Promotions = dynamic(() => import("@/components/Promotions"));
const VibeSelector = dynamic(() => import("@/components/ai/VibeSelector"), { ssr: false });

export const revalidate = 300; // Enable ISR, revalidating every 5 minutes

export default async function Home() {
  const [featuresRes, ctaRes, highlightsRes, config] = await Promise.all([
    getSiteContent<FeaturesContent>("features"),
    getSiteContent<CTAContent>("cta"),
    getSiteContent<HighlightsContent>("highlights"),
    getSiteConfig(),
  ]);

  const featuresContent = featuresRes || undefined;
  const ctaContent = ctaRes || undefined;
  const highlightsContent = highlightsRes || undefined;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Hero />

      <VibeSelector />

      <Promotions config={config.promotions} />

      {/* Dynamic Sections */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100" />}>
        <Highlights content={highlightsContent} />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100" />}>
        <Features content={featuresContent} />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100" />}>
        <CTA content={ctaContent} />
      </Suspense>
    </div>
  );
}
