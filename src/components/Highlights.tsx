import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PenTool, Smile, Utensils, Home as HomeIcon, Package, LucideIcon, Smartphone, Cpu } from "lucide-react";
import { getDepartments, HighlightsContent } from "@/app/actions";
import { motion } from "framer-motion";
import { SectionTitle } from "./ui/Typography";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {departments.slice(0, 3).map((item, idx) => {
                        const Icon = iconMap[item.icon] || Package;

                        return (
                            <Link
                                key={item.id || idx}
                                href={item.link || `/departments#${item.id}`}
                                className="group block h-[650px]"
                            >
                                <Card className="h-full relative overflow-hidden border-none" hover={true}>
                                    <div className="absolute inset-0 z-0">
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/20 to-transparent z-10" />
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>

                                    <div className="absolute inset-0 p-12 flex flex-col justify-end z-20">
                                        <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8 text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                                            <Icon className="w-7 h-7" />
                                        </div>

                                        <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-white/70 mb-8 line-clamp-2 font-light text-lg">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center text-white font-bold text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            {content.exploreLabel || "View Projects"} <ArrowRight className="w-5 h-5 ml-3" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
