import { getSiteContent, AboutPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import AboutContent from "@/components/AboutContent";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "About Us",
        description: "Learn about Gharana Realtors' story, our curated property listings, and our commitment to architectural excellence.",
        urlPath: "/about",
        config
    });
}

async function AboutPageContentLoader() {
    const [pageContent, siteConfig] = await Promise.all([
        getSiteContent<AboutPageContent>("about-page"),
        getSiteConfig()
    ]);

    const contactContent = {
        address: siteConfig.contact.address,
        phone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        mapEmbed: siteConfig.contact.mapEmbedUrl,
        storeHours: siteConfig.contact.storeHours || ""
    };

    return (
        <AboutContent content={pageContent} contact={contactContent} />
    );
}

export default function AboutPage() {
    return (
        <div className="bg-brand-white min-h-screen">
            <Suspense fallback={<div className="min-h-screen bg-brand-charcoal animate-pulse" />}>
                <AboutPageContentLoader />
            </Suspense>
        </div>
    );
}
