import { getSiteContent, AboutPageContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import AboutContent from "@/components/AboutContent";

export const dynamic = "force-dynamic";

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
        storeHours: "" // Will use default fallback in AboutContent
    };

    return <AboutContent content={pageContent} contact={contactContent} />;
}
