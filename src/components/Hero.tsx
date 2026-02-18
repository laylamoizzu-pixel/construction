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
        <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden bg-brand-dark">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 overflow-hidden">
                        <Image
                            src={slide.backgroundImageUrl}
                            alt={slide.title}
                            fill
                            className="object-cover object-center transition-transform duration-[20s] animate-slow-zoom"
                            priority
                            sizes="100vw"
                        />
                    </div>

                    {/* Modern Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
                    <div
                        className="absolute inset-0 bg-brand-blue/10 mix-blend-overlay"
                        style={{ opacity: slide.overlayOpacity }}
                    />

                    <div className="container mx-auto px-4 md:px-6 relative z-10 h-full flex items-center">
                        <div className="max-w-3xl pt-16 md:pt-20">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-brand-lime text-xs font-medium tracking-wide mb-6 uppercase">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Smart Avenue 99</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                                    {slide.title.split(" ").map((word, i) => (
                                        <span key={i} className={i === 1 ? "text-gradient block" : "block"}>
                                            {word}{" "}
                                        </span>
                                    ))}
                                </h1>

                                <p className="text-lg md:text-2xl text-slate-300 mb-10 font-light max-w-2xl leading-relaxed">
                                    {slide.subtitle}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href={slide.ctaLink || "/products"}>
                                        <button className="group relative px-8 py-4 bg-brand-blue hover:bg-sky-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-brand-blue/25 hover:shadow-brand-blue/40 flex items-center gap-2">
                                            {slide.ctaText}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                    <Link href={slide.learnMoreLink || "/offers"}>
                                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-medium backdrop-blur-md transition-all">
                                            Learn More
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            {slides.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
                    <button onClick={prevSlide} aria-label="Previous slide" className="p-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-brand-blue w-8" : "bg-white/30"}`}
                            />
                        ))}
                    </div>
                    <button onClick={nextSlide} aria-label="Next slide" className="p-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Decorative Elements */}
            <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-t from-brand-lime/20 to-transparent blur-[120px] pointer-events-none" />
        </section>
    );
}
