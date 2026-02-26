import { getDepartments, getSiteContent, DepartmentsPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import DepartmentsGrid from "@/components/DepartmentsGrid";
import Image from "next/image";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 3600;


export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "Property Types",
        description: "Explore our curated property types including Residential, Commercial, Plots, and Villas at Gharana Realtors.",
        urlPath: "/departments",
        config
    });
}

async function DepartmentsHeader() {
    const pageContent = await getSiteContent<DepartmentsPageContent>("departments-page");
    const heroTitle = pageContent?.heroTitle || "Our Property Types";
    const heroSubtitle = pageContent?.heroSubtitle || "Curated categories for modern living.";
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
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/20 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                    />
                </>
            )}

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <span className="text-brand-lime font-bold tracking-widest uppercase text-xs mb-4 block animate-pulse">
                    {pageContent?.heroLabel || "Explore Zones"}
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

async function DepartmentsGridLoader() {
    const departments = await getDepartments();
    return <DepartmentsGrid departments={departments} />;
}

export default function DepartmentsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Tech Editorial Header */}
            <Suspense fallback={<div className="h-96 bg-brand-dark animate-pulse" />}>
                <DepartmentsHeader />
            </Suspense>

            <div className="container mx-auto px-4 md:px-6 py-12 -mt-10 relative z-20">
                <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-xl" />}>
                    <DepartmentsGridLoader />
                </Suspense>
            </div>
        </div>
    );
}
