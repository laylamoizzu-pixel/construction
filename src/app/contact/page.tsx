import { getSiteConfig } from "@/app/actions/site-config";
import ContactContent from "@/components/ContactContent";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "Contact Us",
        description: "Get in touch with Gharana Realtors for premium property inquiries, site visits, and construction consultations.",
        urlPath: "/contact",
        config
    });
}

async function ContactPageContentLoader() {
    const siteConfig = await getSiteConfig();

    const contactContent = {
        address: siteConfig.contact.address,
        phone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        mapEmbed: siteConfig.contact.mapEmbedUrl,
        storeHours: siteConfig.contact.storeHours || ""
    };

    return (
        <ContactContent contact={contactContent} />
    );
}

export default function ContactPage() {
    return (
        <div className="bg-brand-white min-h-screen">
            <Suspense fallback={<div className="min-h-screen bg-brand-charcoal animate-pulse" />}>
                <ContactPageContentLoader />
            </Suspense>
        </div>
    );
}
