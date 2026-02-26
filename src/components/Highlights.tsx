import Link from "next/link";
import { PenTool, Smile, Utensils, Home as HomeIcon, Package, LucideIcon, Smartphone, Cpu } from "lucide-react";
import { getDepartments, HighlightsContent } from "@/app/actions";
import { SectionTitle } from "./ui/Typography";
import { Button } from "./ui/Button";
import HighlightsClient from "./HighlightsClient";

const iconMap: Record<string, LucideIcon> = {
    PenTool,
    Smile,
    Utensils,
    Home: HomeIcon,
    Package,
    Smartphone,
    Cpu
};

export default async function Highlights({ content }: { content?: HighlightsContent }) {
    const departments = await getDepartments();

    if (departments.length === 0 || !content) {
        return null;
    }

    // Convert Departments to safe format for Client Component
    const safeDepartments = departments.map(d => ({
        id: d.id || "",
        title: d.title,
        description: d.description,
        image: d.image,
        icon: d.icon,
        link: d.link
    }));

    return (
        <section className="py-40 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
                    <div className="max-w-3xl">
                        <SectionTitle subtitle={content.subtitle || "Expertise"}>
                            {content.title}
                        </SectionTitle>
                        <p className="text-brand-charcoal/50 text-xl leading-relaxed font-light max-w-2xl">
                            {content.description}
                        </p>
                    </div>

                    <Link href="/departments">
                        <Button variant="outline" size="lg">
                            {content.viewAllLabel || "Portfolio"}
                        </Button>
                    </Link>
                </div>

                <HighlightsClient
                    departments={safeDepartments}
                    exploreLabel={content.exploreLabel}
                    iconMap={iconMap}
                />
            </div>
        </section>
    );
}
