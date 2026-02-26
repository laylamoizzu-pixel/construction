"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Smile, Utensils, Home as HomeIcon, Package, ArrowRight, X, LucideIcon, Cpu, Smartphone, Building2, Trees, Landmark } from "lucide-react";
import { DepartmentContent } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
    PenTool,
    Smile,
    Utensils,
    Home: HomeIcon,
    Package,
    Cpu,
    Smartphone,
    Building2,
    Trees,
    Landmark
};

export default function DepartmentsGrid({ departments }: { departments: DepartmentContent[] }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (departments.length === 0) {
        return (
            <div className="text-center py-24 bg-white/50 rounded-[3rem] border border-brand-charcoal/5">
                <Package className="w-16 h-16 mx-auto mb-6 text-brand-charcoal/10" />
                <p className="text-brand-charcoal/40 text-lg font-light">No property tiers defined yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[450px]">
                {departments.map((dept, i) => {
                    const Icon = iconMap[dept.icon] || Package;
                    // Alternating masonry-style layout
                    const isLarge = i === 0 || i === 3 || i === 4;
                    const className = isLarge ? "md:col-span-2" : "";

                    return (
                        <motion.div
                            key={dept.id || `dept-${i}`}
                            layoutId={dept.id || `dept-${i}`}
                            onClick={() => setSelectedId(dept.id || `dept-${i}`)}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "group relative cursor-pointer rounded-[2.5rem] overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-700 bg-brand-charcoal",
                                className
                            )}
                        >
                            {/* Image Background */}
                            <div className="absolute inset-0 h-full w-full">
                                <Image
                                    src={dept.image}
                                    alt={dept.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/20 to-transparent" />
                            </div>

                            {/* Content Overaly */}
                            <div className="absolute inset-0 p-10 flex flex-col justify-end z-10">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-brand-gold border border-white/20 group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-brand-charcoal transition-all duration-500">
                                            <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-bold text-white tracking-tighter">{dept.title}</h2>
                                        <p className="text-white/40 font-light leading-relaxed line-clamp-2 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            {dept.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Expanded View Modal (Refined Glassmorphism) */}
            <AnimatePresence>
                {selectedId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="absolute inset-0 bg-brand-charcoal/80 backdrop-blur-xl"
                        />

                        {departments.map((dept, i) => {
                            const id = dept.id || `dept-${i}`;
                            if (id !== selectedId) return null;
                            const Icon = iconMap[dept.icon] || Package;

                            return (
                                <motion.div
                                    key={id}
                                    layoutId={id}
                                    className="bg-brand-white w-full max-w-6xl max-h-[90vh] rounded-[3rem] overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row border border-brand-charcoal/5"
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                                        className="absolute top-8 right-8 z-20 w-12 h-12 bg-white/50 hover:bg-white text-brand-charcoal rounded-full transition-all backdrop-blur-md flex items-center justify-center border border-brand-charcoal/5"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    {/* Image Side */}
                                    <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
                                        <Image
                                            src={dept.image}
                                            alt={dept.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-white via-transparent to-transparent md:hidden" />
                                    </div>

                                    {/* Content Side */}
                                    <div className="w-full md:w-1/2 p-10 md:p-20 overflow-y-auto bg-brand-white flex flex-col">
                                        <div className="space-y-12">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="p-4 bg-brand-gold/10 rounded-2xl text-brand-gold">
                                                        <Icon className="w-10 h-10" />
                                                    </div>
                                                    <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Architectural Tier</span>
                                                </div>
                                                <h2 className="text-5xl md:text-6xl font-bold text-brand-charcoal tracking-tighter leading-[0.9]">{dept.title}</h2>
                                            </div>

                                            <div className="space-y-8">
                                                <p className="text-xl md:text-2xl text-brand-charcoal/60 leading-relaxed font-light">
                                                    {dept.description}
                                                </p>

                                                <div className="grid grid-cols-2 gap-8 py-10 border-y border-brand-charcoal/5">
                                                    <div>
                                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30 mb-2">Availability</h4>
                                                        <p className="text-brand-charcoal font-bold">Limited Portfolio</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30 mb-2">Yield Potential</h4>
                                                        <p className="text-brand-charcoal font-bold">High Precision</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                href={dept.link || `/products?category=${encodeURIComponent(dept.title)}`}
                                                className="w-full h-16 bg-brand-charcoal text-white rounded-full font-bold hover:bg-brand-gold transition-all flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest shadow-lg shadow-brand-charcoal/20"
                                            >
                                                Explore {dept.title} <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
