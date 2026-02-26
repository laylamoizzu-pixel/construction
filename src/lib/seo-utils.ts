import { Metadata } from "next";
import { SiteConfig } from "@/types/site-config";

interface SeoProps {
    title: string;
    description?: string;
    urlPath?: string;
    imageUrl?: string;
    config: SiteConfig;
}

/**
 * Generates unified metadata for pages including proper OpenGraph and Twitter cards.
 */
export function constructMetadata({ title, description, urlPath = "", imageUrl, config }: SeoProps): Metadata {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gharanarealtors.com";
    const finalDescription = description || config.seo.metaDescription;
    const finalUrl = urlPath ? `${siteUrl}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}` : siteUrl;
    const finalImage = imageUrl || config.seo.ogImageUrl || config.branding.logoUrl || "/logo.png";

    return {
        title: title, // Next.js will use the titleTemplate from layout if we just pass the raw title string, but let's be explicit
        description: finalDescription,
        keywords: config.seo.keywords,
        alternates: {
            canonical: finalUrl,
        },
        openGraph: {
            title: title ? `${title} | ${config.branding.siteName}` : config.seo.siteTitle,
            description: finalDescription,
            url: finalUrl,
            siteName: config.branding.siteName,
            images: [
                {
                    url: finalImage,
                    width: 1200,
                    height: 630,
                    alt: title || config.branding.siteName,
                },
            ],
            type: "website",
            locale: "en_IN",
        },
        twitter: {
            card: "summary_large_image",
            site: config.seo.twitterHandle,
            creator: config.seo.twitterHandle,
            title: title ? `${title} | ${config.branding.siteName}` : config.seo.siteTitle,
            description: finalDescription,
            images: [finalImage],
        }
    };
}
