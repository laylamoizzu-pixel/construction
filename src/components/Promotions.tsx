"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PromotionsConfig } from "@/types/site-config";
import { motion, AnimatePresence } from "framer-motion";
import { Heading, Subheading } from "./ui/Typography";
import { cn } from "@/lib/utils";

export default function Promotions({ config }: { config?: PromotionsConfig }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const activeItems = config?.items.filter(item => item.active) || [];

    useEffect(() => {
        if (activeItems.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeItems.length);
        }, 6000);

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

    const currentItem = activeItems[currentIndex];

    return (
        <section className="py-24 bg-brand-white border-y border-brand-silver/30">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex items-center justify-between mb-12">
                    <Heading className="text-3xl md:text-5xl font-bold tracking-tight text-brand-charcoal">
                        {config.title}
                    </Heading>

                    {activeItems.length > 1 && (
                        <div className="flex gap-4">
                            <button
                                onClick={prevSlide}
                                className="p-3 rounded-full border border-brand-silver hover:bg-brand-charcoal hover:text-white transition-all duration-300"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="p-3 rounded-full border border-brand-silver hover:bg-brand-charcoal hover:text-white transition-all duration-300"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative aspect-[21/9] md:aspect-[3/1] rounded-[2rem] overflow-hidden shadow-premium bg-brand-charcoal">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentItem.id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0"
                        >
                            <Link href={currentItem.link || "#"} className={cn("block w-full h-full relative group", !currentItem.link && "pointer-events-none")}>
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/40 to-transparent z-10" />
                                <Image
                                    src={currentItem.imageUrl}
                                    alt={currentItem.title || "Promotion"}
                                    fill
                                    className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                                    sizes="100vw"
                                    priority
                                />

                                <div className="absolute inset-y-0 left-0 p-10 md:p-20 flex flex-col justify-center z-20 max-w-2xl">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">
                                            Exclusive Offer
                                        </span>
                                        <h3 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-[1.1]">
                                            {currentItem.title}
                                        </h3>
                                        {currentItem.link && (
                                            <div className="flex items-center text-brand-gold font-bold text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-500">
                                                Learn More <ArrowRight className="w-5 h-5 ml-3" />
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </Link>
                        </motion.div>
                    </AnimatePresence>

                    {activeItems.length > 1 && (
                        <div className="absolute bottom-8 right-12 flex gap-3 z-30">
                            {activeItems.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "h-1 transition-all duration-500 rounded-full",
                                        idx === currentIndex ? "bg-brand-gold w-12" : "bg-white/20 w-6 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
