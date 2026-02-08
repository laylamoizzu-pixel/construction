"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Smile, Utensils, Home as HomeIcon, Package, ArrowRight, X } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { DEPARTMENTS } from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
    PenTool,
    Smile,
    Utensils,
    Home: HomeIcon,
    Package,
};

export default function DepartmentsPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 md:px-6">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4">
                        Explore Our <span className="text-brand-gold">Departments</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Discover a world of premium products across our specialized retail zones.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {DEPARTMENTS.map((dept) => {
                        const Icon = iconMap[dept.icon];
                        return (
                            <motion.div
                                key={dept.id}
                                layoutId={dept.id}
                                onClick={() => setSelectedId(dept.id)}
                                className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow h-[300px]"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${dept.image})` }}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

                                <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <h2 className="text-2xl font-bold">{dept.title}</h2>
                                            </div>
                                            <p className="text-gray-200 opacity-90">{dept.description}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-dark transition-colors">
                                            <ArrowRight className="w-5 h-5" />
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedId(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />

                            {DEPARTMENTS.map((dept) => {
                                if (dept.id !== selectedId) return null;
                                const Icon = iconMap[dept.icon];

                                return (
                                    <motion.div
                                        key={dept.id}
                                        layoutId={dept.id}
                                        className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-[600px]"
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                                            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>

                                        {/* Image Side */}
                                        <div
                                            className="w-full md:w-1/2 h-1/2 md:h-full bg-cover bg-center relative"
                                            style={{ backgroundImage: `url(${dept.image})` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                                            <div className="absolute bottom-6 left-6 text-white md:hidden">
                                                <h2 className="text-3xl font-bold mb-1">{dept.title}</h2>
                                                <div className="flex items-center gap-2 text-sm text-gray-200">
                                                    <Icon className="w-4 h-4" />
                                                    <span>Department</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Side */}
                                        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                                            <div className="hidden md:flex items-center gap-4 mb-6">
                                                <div className="p-3 bg-brand-green/10 rounded-xl text-brand-green">
                                                    <Icon className="w-8 h-8" />
                                                </div>
                                                <h2 className="text-4xl font-serif font-bold text-brand-dark">{dept.title}</h2>
                                            </div>

                                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                                Welcome to the {dept.title} at Smart Avenue. We have curated a collection of premium items to elevate your lifestyle.
                                                {/* Placeholder text for more content */}
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                            </p>

                                            <h3 className="text-lg font-bold text-brand-dark mb-4">Featured Categories</h3>
                                            <ul className="grid grid-cols-2 gap-3 mb-8">
                                                {["New Arrivals", "Best Sellers", "Premium Collection", "Seasonal Offers"].map((item) => (
                                                    <li key={item} className="flex items-center gap-2 text-gray-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>

                                            <button className="w-full py-4 bg-brand-dark text-white rounded-xl font-semibold hover:bg-brand-green transition-colors flex items-center justify-center gap-2">
                                                Browse Full Catalog <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
