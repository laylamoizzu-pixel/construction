import { getSiteContent, AboutPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import AboutContent from "@/components/AboutContent";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "About Us",
        description: "Learn about Smart Avenue 99's story, our curated collections, and our Genie AI shopping assistants.",
        urlPath: "/about",
        config
    });
}

export default async function AboutPage() {
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
        "url": "https://smartavenue99.com/about",
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
