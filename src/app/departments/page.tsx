import { getDepartments, getSiteContent, DepartmentsPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import DepartmentsGrid from "@/components/DepartmentsGrid";
import Image from "next/image";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";
import { Suspense } from "react";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";

export const revalidate = 3600;


export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "Property Tiers",
        description: "Explore our curated property types including Residential, Commercial, Plots, and Villas at Gharana Realtors.",
        urlPath: "/departments",
        config
    });
}

async function DepartmentsHeader() {
    const pageContent = await getSiteContent<DepartmentsPageContent>("departments-page");
    const heroTitle = pageContent?.heroTitle || "Architectural Tiers";
    const heroSubtitle = pageContent?.heroSubtitle || "Curated sectors for modern capital.";
    const heroImage = pageContent?.heroImage || "";

    return (
        <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-brand-charcoal">
            <div className="absolute inset-0 z-0">
                {heroImage ? (
                    <Image src={heroImage} alt="Hero Background" fill className="object-cover opacity-40 scale-105" />
                ) : (
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "radial-gradient(circle at center, #C5A059 1px, transparent 1px)", backgroundSize: "64px 64px" }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-charcoal/40 to-brand-charcoal" />
            </div>

            <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
                <AnimatedContainer
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-8"
                >
                    <span className="text-brand-gold font-bold tracking-[0.5em] uppercase text-[10px] block">
                        {pageContent?.heroLabel || "Design Ecosystem"}
                    </span>
                    <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.8] mb-8">
                        {heroTitle}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
                        {heroSubtitle}
                    </p>
                </AnimatedContainer>
            </div>
        </section>
    );
}

async function DepartmentsGridLoader() {
    const departments = await getDepartments();
    return <DepartmentsGrid departments={departments} />;
}

export default function DepartmentsPage() {
    return (
        <main className="min-h-screen bg-brand-white">
            <Suspense fallback={<div className="h-[80vh] bg-brand-charcoal animate-pulse" />}>
                <DepartmentsHeader />
            </Suspense>

            <div className="container mx-auto px-6 md:px-12 py-24 -mt-32 relative z-20">
                <Suspense fallback={<div className="h-96 bg-white/50 animate-pulse rounded-[3rem]" />}>
                    <DepartmentsGridLoader />
                </Suspense>
            </div>
        </main>
    );
}
