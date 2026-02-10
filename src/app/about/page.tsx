import { getSiteContent, AboutPageContent } from "@/app/actions";
import AboutContent from "@/components/AboutContent";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
    const pageContent = await getSiteContent<AboutPageContent>("about-page");

    return <AboutContent content={pageContent} />;
}
