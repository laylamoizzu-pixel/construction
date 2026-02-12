"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PromotionsConfig } from "@/types/site-config";
import { motion, AnimatePresence } from "framer-motion";

export default function Promotions({ config }: { config?: PromotionsConfig }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter active items
    const activeItems = config?.items.filter(item => item.active) || [];

    // Auto-rotate if multiple items
    useEffect(() => {
        if (activeItems.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeItems.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(interval);
    }, [activeItems.length]);

    if (!config?.enabled || activeItems.length === 0) {
        return null;
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
    };

    return (
        <section className="py-12 bg-white border-b border-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                        {config.title}
                    </h2>

                    {/* Controls for multiple items */}
                    {activeItems.length > 1 && (
                        <div className="flex gap-2">
                            <button
                                onClick={prevSlide}
                                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeItems[currentIndex].id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                        >
                            {/* Wrap in Link if link exists, otherwise just div */}
                            {activeItems[currentIndex].link ? (
                                <Link href={activeItems[currentIndex].link} className="block w-full h-full relative cursor-pointer group">
                                    <Image
                                        src={activeItems[currentIndex].imageUrl}
                                        alt={activeItems[currentIndex].title || "Promotion"}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 80vw"
                                        priority={currentIndex === 0}
                                    />
                                    {/* Optional Overlay Title */}
                                    {activeItems[currentIndex].title && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-10 pointer-events-none">
                                            <h3 className="text-white text-xl md:text-3xl font-bold">
                                                {activeItems[currentIndex].title}
                                            </h3>
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <div className="w-full h-full relative">
                                    <Image
                                        src={activeItems[currentIndex].imageUrl}
                                        alt={activeItems[currentIndex].title || "Promotion"}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 80vw"
                                        priority={currentIndex === 0}
                                    />
                                    {activeItems[currentIndex].title && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-10 pointer-events-none">
                                            <h3 className="text-white text-xl md:text-3xl font-bold">
                                                {activeItems[currentIndex].title}
                                            </h3>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Indicators */}
                    {activeItems.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {activeItems.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
