"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Smile, Utensils, Home as HomeIcon, Package, ArrowRight, X, LucideIcon, Cpu, Smartphone } from "lucide-react";
import { DepartmentContent } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";


const iconMap: Record<string, LucideIcon> = {
    PenTool,
    Smile,
    Utensils,
    Home: HomeIcon,
    Package,
    Cpu,
    Smartphone
};

export default function DepartmentsGrid({ departments }: { departments: DepartmentContent[] }) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // If no departments exist in the database, show empty state
    if (departments.length === 0) {
        return (
            <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 text-lg">No departments available yet.</p>
                <p className="text-slate-400 text-sm mt-1">Departments can be added from the admin panel.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
                {departments.map((dept, i) => {
                    const Icon = iconMap[dept.icon] || Package;
                    // Make some items span 2 columns/rows for masonry effect
                    const isLarge = i === 0 || i === 3;
                    const className = isLarge ? "md:col-span-2" : "";

                    return (
                        <motion.div
                            key={dept.id || `dept-${i}`}
                            layoutId={dept.id || `dept-${i}`}
                            onClick={() => setSelectedId(dept.id || `dept-${i}`)}
                            className={`group relative cursor-pointer rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white ${className}`}
                        >
                            {/* Image Background */}
                            <div className="absolute inset-0 h-full w-full">
                                <Image
                                    src={dept.image}
                                    alt={dept.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                                <div className="flex items-end justify-between">
                                    <div className="max-w-[80%]">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 text-brand-lime border border-white/10">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{dept.title}</h2>
                                        <p className="text-slate-300 line-clamp-2 md:line-clamp-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-sm md:text-base font-light">
                                            {dept.description}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-brand-lime group-hover:text-brand-dark group-hover:border-brand-lime transition-all duration-300 opacity-0 group-hover:opacity-100">
                                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Expanded View Modal */}
            <AnimatePresence>
                {selectedId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {departments.map((dept, i) => {
                            const id = dept.id || `dept-${i}`;
                            if (id !== selectedId) return null;
                            const Icon = iconMap[dept.icon] || Package;

                            return (
                                <motion.div
                                    key={id}
                                    layoutId={id}
                                    className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row"
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                                        className="absolute top-6 right-6 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    {/* Image Side */}
                                    <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                                        <Image
                                            src={dept.image}
                                            alt={dept.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                                    </div>

                                    {/* Content Side */}
                                    <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-brand-blue/10 rounded-xl text-brand-blue">
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight">{dept.title}</h2>
                                        </div>

                                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                            {dept.description}
                                        </p>

                                        <div className="mt-auto space-y-6">


                                            <Link
                                                href={dept.link || `/products?search=${encodeURIComponent(dept.title)}`}
                                                className="w-full py-4 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-blue transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-dark/20 hover:shadow-brand-blue/30"
                                            >
                                                Browse {dept.title} <ArrowRight className="w-5 h-5" />
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
