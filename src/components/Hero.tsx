"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { HeroConfig } from "@/types/site-config";

export default function Hero() {
    const { config } = useSiteConfig();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Use unified config from context if available, fallback to provided content for safety
    // For this version, we prioritize the new multi-slide config
    const heroConfig = config?.hero as HeroConfig;
    const slides = heroConfig?.slides || [];

    // Auto-advance slides
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (!slides || slides.length === 0) return null;

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const slide = slides[currentSlide];

    return (
        <section className="relative h-[92vh] min-h-[700px] flex items-center overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    {/* Background Image with subtle zoom */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={slide.backgroundImageUrl}
                                alt={slide.title}
                                fill
                                className="object-cover object-center brightness-[0.7]"
                                priority
                                sizes="100vw"
                            />
                        </motion.div>
                    </div>

                    {/* Sophisticated Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />

                    <div className="container mx-auto px-6 md:px-12 relative z-10 h-full flex items-center">
                        <div className="max-w-4xl pt-20">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-brand-gold text-[10px] font-bold tracking-[0.2em] mb-8 uppercase">
                                    <Sparkles className="w-3 h-3 fill-brand-gold" />
                                    <span>Gharana Premium Realty</span>
                                </div>

                                <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-[0.95] tracking-[-0.04em]">
                                    {slide.title.split(" ").map((word, i) => (
                                        <span key={i} className={i === 1 ? "text-gradient-gold block" : "block"}>
                                            {word}{" "}
                                        </span>
                                    ))}
                                </h1>

                                <p className="text-xl md:text-2xl text-white/70 mb-12 font-medium max-w-2xl leading-relaxed tracking-tight">
                                    {slide.subtitle}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    <Link href={slide.ctaLink || "/products"} className="group">
                                        <button className="relative px-10 py-5 bg-white text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden">
                                            <span className="relative z-10">{slide.ctaText}</span>
                                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold to-brand-accent opacity-0 group-hover:opacity-10 transition-opacity" />
                                        </button>
                                    </Link>
                                    <Link href={slide.learnMoreLink || "/offers"}>
                                        <button className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-full font-bold backdrop-blur-xl transition-all hover:scale-105 active:scale-95">
                                            View Portfolio
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slider Controls - Refined */}
            {slides.length > 1 && (
                <div className="absolute bottom-12 right-12 z-20 flex items-center gap-8">
                    <div className="flex gap-3">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`h-1 transition-all duration-500 rounded-full ${i === currentSlide ? "bg-brand-gold w-12" : "bg-white/20 w-6 hover:bg-white/40"}`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={prevSlide} className="p-3 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all backdrop-blur-md" aria-label="Previous slide">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={nextSlide} className="p-3 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all backdrop-blur-md" aria-label="Next slide">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 hidden md:block"
            >
                <div className="w-[1px] h-24 bg-gradient-to-b from-white/50 to-transparent relative">
                    <motion.div
                        animate={{ y: [0, 24, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 left-[-1.5px] w-[4px] h-[4px] bg-brand-gold rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
}
