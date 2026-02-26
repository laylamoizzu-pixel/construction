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
const ProjectFinder = dynamic(() => import("@/components/ai/ProjectFinder"));
const PropertyAdvisor = dynamic(() => import("@/components/ai/PropertyAdvisor"));

export const revalidate = 300; // Enable ISR, revalidating every 5 minutes

// Section Loaders
async function PropertyAdvisorSection() {
  const aiSettings = await getAISettings();
  if (!aiSettings.showVibeSelector) return null; // Reusing vibe selector flag for Property Advisor
  return <PropertyAdvisor />;
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

async function ProjectFinderSection() {
  const aiSettings = await getAISettings();
  if (!aiSettings.enabled) return null;
  return (
    <div className="bg-brand-white py-24">
      <div className="container mx-auto px-6">
        <ProjectFinder />
      </div>
    </div>
  );
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
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Hero />

      <Suspense fallback={null}>
        <PropertyAdvisorSection />
      </Suspense>

      <Suspense fallback={<div className="h-48 animate-pulse bg-slate-100" />}>
        <PromotionsSection />
      </Suspense>

      {/* Dynamic Sections */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100" />}>
        <HighlightsSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100" />}>
        <ProjectFinderSection />
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
