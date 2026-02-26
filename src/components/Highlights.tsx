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

import { motion } from "framer-motion";

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
        <section className="py-32 bg-slate-50 relative overflow-hidden">
            {/* Minimalist Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.02]"
                style={{
                    backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }}
            />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
                    <div className="max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-brand-blue font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block"
                        >
                            {finalContent.subtitle}
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-black mb-8 tracking-[-0.03em]"
                        >
                            {finalContent.title}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-xl leading-relaxed font-medium"
                        >
                            {finalContent.description}
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link href="/departments" className="group flex items-center gap-3 text-black font-bold text-lg hover:text-brand-blue transition-all">
                            {finalContent.viewAllLabel || "Explore Portfolio"}
                            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:border-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {departments.slice(0, 3).map((item, idx) => {
                        const Icon = iconMap[item.icon] || Package;

                        return (
                            <motion.div
                                key={item.id || idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link
                                    href={item.link || `/departments#${item.id}`}
                                    className="group relative h-[600px] block overflow-hidden rounded-[3rem] bg-white shadow-2xl shadow-black/5 hover:shadow-black/20 transition-all duration-700"
                                >
                                    {/* Image Container */}
                                    <div className="absolute inset-0 h-full overflow-hidden">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10" />
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>

                                    {/* Content Container */}
                                    <div className="absolute inset-0 p-12 flex flex-col justify-end z-20">
                                        <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8 text-white group-hover:bg-brand-gold group-hover:border-brand-gold transition-all duration-500">
                                                <Icon className="w-8 h-8" />
                                            </div>

                                            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                                                {item.title}
                                            </h3>
                                            <p className="text-white/70 mb-8 line-clamp-2 font-medium">
                                                {item.description}
                                            </p>

                                            <div className="flex items-center text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                {finalContent.exploreLabel || "Full Case Study"} <ArrowRight className="w-5 h-5 ml-3" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
