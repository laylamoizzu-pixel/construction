import Hero from "@/components/Hero";
import dynamic from "next/dynamic";
import { getSiteContent, FeaturesContent, CTAContent, HighlightsContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import { getAISettings } from "@/app/actions/ai-settings-actions";
import { Suspense } from "react";

// Lazy-load below-the-fold components
const Highlights = dynamic(() => import("@/components/Highlights"));
const Features = dynamic(() => import("@/components/Features"));
const CTA = dynamic(() => import("@/components/CTA"));
const Promotions = dynamic(() => import("@/components/Promotions"));
const VibeSelector = dynamic(() => import("@/components/ai/VibeSelector"));

export const revalidate = 300; // Enable ISR, revalidating every 5 minutes

// Section Loaders
async function VibeSelectorSection() {
  const aiSettings = await getAISettings();
  if (!aiSettings.showVibeSelector) return null;
  return <VibeSelector />;
}

async function PromotionsSection() {
  const config = await getSiteConfig();
  return <Promotions config={config.promotions} />;
}

async function HighlightsSection() {
  const highlightsRes = await getSiteContent<HighlightsContent>("highlights");
  return <Highlights content={highlightsRes || undefined} />;
}

async function FeaturesSection() {
  const featuresRes = await getSiteContent<FeaturesContent>("features");
  return <Features content={featuresRes || undefined} />;
}

async function CTASection() {
  const [ctaRes, aiSettings] = await Promise.all([
    getSiteContent<CTAContent>("cta"),
    getAISettings(),
  ]);
  return <CTA content={ctaRes || undefined} aiEnabled={aiSettings.enabled} />;
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Hero />

      <Suspense fallback={null}>
        <VibeSelectorSection />
      </Suspense>

      <Suspense fallback={<div className="h-48 animate-pulse bg-slate-100" />}>
        <PromotionsSection />
      </Suspense>

      {/* Dynamic Sections */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100" />}>
        <HighlightsSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100" />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100" />}>
        <CTASection />
      </Suspense>
    </div>
  );
}
