import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PenTool, Smile, Utensils, Home as HomeIcon, Package, LucideIcon, Smartphone, Cpu } from "lucide-react";
import { getDepartments, HighlightsContent } from "@/app/actions";

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

    // If no departments exist in the database, don't render the section
    if (departments.length === 0) {
        return null;
    }

    // If no content provided, do not render
    if (!content) {
        return null;
    }

    const finalContent = content;

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Tech Grid Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}
            />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <span className="text-brand-blue font-bold tracking-widest uppercase text-xs mb-2 block">{finalContent.subtitle}</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 tracking-tight">
                            {finalContent.title}
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            {finalContent.description}
                        </p>
                    </div>
                    <Link href="/departments" className="group flex items-center gap-2 text-brand-dark font-semibold border-b border-brand-dark/20 pb-1 hover:text-brand-blue hover:border-brand-blue transition-all">
                        {finalContent.viewAllLabel || "View All Property Types"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {departments.slice(0, 3).map((item, idx) => {
                        const Icon = iconMap[item.icon] || Package;

                        return (
                            <Link
                                key={item.id || idx}
                                href={item.link || `/departments#${item.id}`}
                                className="group relative h-[500px] overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-dark/5 hover:shadow-2xl hover:shadow-brand-blue/10 transition-all duration-500"
                            >
                                {/* Image Container */}
                                <div className="absolute inset-0 h-2/3 overflow-hidden">
                                    <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors z-10" />
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>

                                {/* Content Container */}
                                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-white via-white to-transparent pt-12 px-8 pb-8 flex flex-col justify-end">
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                                            <Icon className="w-7 h-7" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-brand-dark mb-2 group-hover:text-brand-blue transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 mb-6 line-clamp-2">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center text-brand-dark font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                                            {finalContent.exploreLabel || "Explore Category"} <ArrowRight className="w-4 h-4 ml-2" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
