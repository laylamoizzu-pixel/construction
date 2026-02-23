import { getDepartments, getSiteContent, DepartmentsPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import DepartmentsGrid from "@/components/DepartmentsGrid";
import Image from "next/image";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "Departments",
        description: "Explore our curated departments including Electronics, Fashion, Home Goods, and Groceries at Smart Avenue 99.",
        urlPath: "/departments",
        config
    });
}

export default async function DepartmentsPage() {
    const [departments, pageContent] = await Promise.all([
        getDepartments(),
        getSiteContent<DepartmentsPageContent>("departments-page")
    ]);

    const heroTitle = pageContent?.heroTitle || "Our Departments";
    const heroSubtitle = pageContent?.heroSubtitle || "Curated collections for the modern lifestyle.";
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

            <div className="container mx-auto px-4 md:px-6 py-12 -mt-10 relative z-20">
                <DepartmentsGrid departments={departments} />
            </div>
        </div>
    );
}
