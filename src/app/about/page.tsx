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
        description: "Learn about Gharana Realtors' story, our curated property listings, and our Genie AI property assistants.",
        urlPath: "/about",
        config
    });
}

async function AboutPageContentLoader() {
    const [pageContent, siteConfig] = await Promise.all([
        getSiteContent<AboutPageContent>("about-page"),
        getSiteConfig()
    ]);

    // Adapt SiteConfig contact to match ContactContent interface expected by AboutContent
    const contactContent = {
        address: siteConfig.contact.address,
        phone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        mapEmbed: siteConfig.contact.mapEmbedUrl,
        storeHours: siteConfig.contact.storeHours || ""
    };

    // Add LocalBusiness Schema for physical stores + Breadcrumbs
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": siteConfig.branding.siteName,
        "image": siteConfig.branding.logoUrl,
        "url": "https://gharanarealtors.com/about",
        "telephone": siteConfig.contact.phone,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": siteConfig.contact.address,
            "addressCountry": siteConfig.seo.jsonLd.addressCountry || "IN"
        },
        "priceRange": siteConfig.seo.jsonLd.priceRange || "₹₹"
    };

    // Add FAQ Schema for AI Search / GEO
    const faqSchema = siteConfig.llm?.faqItems?.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": siteConfig.llm.faqItems.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <AboutContent content={pageContent} contact={contactContent} />
        </>
    );
}

export default function AboutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}>
            <AboutPageContentLoader />
        </Suspense>
    );
}
