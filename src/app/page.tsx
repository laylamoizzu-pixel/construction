import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Promotions from "@/components/Promotions";
import VibeSelector from "@/components/ai/VibeSelector";
import { getSiteContent, FeaturesContent, CTAContent, HighlightsContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

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
