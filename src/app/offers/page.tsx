import { getOffers, getSiteContent, OffersPageContent } from "@/app/actions";
import OffersList from "@/components/OffersList";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
    const [offers, pageContent] = await Promise.all([
        getOffers(),
        getSiteContent<OffersPageContent>("offers-page")
    ]);

    const heroTitle = pageContent?.heroTitle || "Weekly Offers";
    const heroSubtitle = pageContent?.heroSubtitle || "Curated deals and premium privileges for our valued members.";
    const heroImage = pageContent?.heroImage || "";

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Tech Editorial Header */}
            <div className="relative py-32 bg-brand-dark text-white overflow-hidden">
                {/* Abstract Tech Background */}
                <div className="absolute inset-0 bg-[#0A0A0A]" />
                {heroImage ? (
                    <div className="absolute inset-0 opacity-40">
                        <Image src={heroImage} alt="Hero Background" fill className="object-cover" />
                    </div>
                ) : (
                    <>
                        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-brand-lime/10 to-transparent" />
                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)", backgroundSize: "30px 30px" }}
                        />
                    </>
                )}

                <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                    <span className="text-brand-blue font-bold tracking-[0.2em] uppercase text-xs mb-4 block animate-pulse">
                        Smart Club Exclusives
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        {heroTitle}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        {heroSubtitle}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-16 -mt-10 relative z-20">
                <OffersList offers={offers} catalogueUrl={pageContent?.catalogueUrl} />
            </div>
        </div>
    );
}
