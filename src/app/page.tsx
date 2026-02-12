import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Promotions from "@/components/Promotions";
import { getSiteContent, FeaturesContent, CTAContent, HighlightsContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuresContent = (await getSiteContent<FeaturesContent>("features")) || undefined;
  const ctaContent = (await getSiteContent<CTAContent>("cta")) || undefined;
  const highlightsContent = (await getSiteContent<HighlightsContent>("highlights")) || undefined;
  const config = await getSiteConfig();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Hero />

      <Promotions config={config.promotions} />

      {/* Dynamic Sections */}
      <Highlights content={highlightsContent} />

      <Features content={featuresContent} />

      <CTA content={ctaContent} />
    </div>
  );
}
