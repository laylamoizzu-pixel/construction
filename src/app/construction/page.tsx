import ConstructionContent from "@/components/ConstructionContent";
import { constructMetadata } from "@/lib/seo-utils";
import { getSiteConfig } from "@/app/actions/site-config";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return constructMetadata({
        title: "Construction Services",
        description: "Explore Gharana Realtors' premium construction services, structural auditing, and our 5-stage architectural blueprint.",
        urlPath: "/construction",
        config
    });
}

export default function ConstructionPage() {
    return (
        <ConstructionContent />
    );
}
