import { getOffers, getSiteContent, OffersPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import OffersList from "@/components/OffersList";
import Image from "next/image";
import OfferFilterSidebar from "@/components/OfferFilterSidebar";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 600;


export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "Weekly Offers & Deals",
        description: "Discover exclusive deals, weekly offers, and VIP client privileges at Gharana Realtors.",
        urlPath: "/offers",
        config
    });
}

async function OffersHero() {
    const pageContent = await getSiteContent<OffersPageContent>("offers-page");
    const heroTitle = pageContent?.heroTitle || "Weekly Offers";
    const heroSubtitle = pageContent?.heroSubtitle || "Curated deals and premium privileges for our valued clients.";;
    const heroImage = pageContent?.heroImage || "";

    return (
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
                    VIP Client Exclusives
                </span>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    {heroTitle}
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                    {heroSubtitle}
                </p>
            </div>
        </div>
    );
}

async function OffersContent({ searchParams }: { searchParams: { search?: string; sort?: string } }) {
    const [allOffers, pageContent] = await Promise.all([
        getOffers(),
        getSiteContent<OffersPageContent>("offers-page")
    ]);

    // --- Filtering Logic ---
    let filteredOffers = allOffers;

    // 1. Search
    if (searchParams.search) {
        const searchLower = searchParams.search.toLowerCase();
        filteredOffers = filteredOffers.filter(o =>
            o.title.toLowerCase().includes(searchLower) ||
            (o.description && o.description.toLowerCase().includes(searchLower))
        );
    }

    // 2. Sort
    const sortOption = searchParams.sort || "newest";
    filteredOffers.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOption === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return (
        <div className="flex-1">
            <OffersList
                offers={filteredOffers}
                catalogueUrl={pageContent?.catalogueUrl}
                catalogueTitle={pageContent?.catalogueTitle}
                catalogueSubtitle={pageContent?.catalogueSubtitle}
            />
        </div>
    );
}

export default async function OffersPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string; sort?: string }>
}) {
    const params = await searchParams;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Tech Editorial Header */}
            <Suspense fallback={<div className="h-96 bg-brand-dark animate-pulse" />}>
                <OffersHero />
            </Suspense>

            <div className="container mx-auto px-4 md:px-6 py-16 -mt-10 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <OfferFilterSidebar />

                    {/* Main Content */}
                    <Suspense fallback={<div className="flex-1 h-96 bg-white rounded-xl shadow-sm animate-pulse" />}>
                        <OffersContent searchParams={params} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
