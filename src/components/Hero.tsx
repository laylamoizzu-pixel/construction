"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { HeroConfig } from "@/types/site-config";
import { Heading, Subheading } from "./ui/Typography";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

export default function Hero() {
    const { config } = useSiteConfig();
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroConfig = config?.hero as HeroConfig;
    const slides = heroConfig?.slides || [];

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
        <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-brand-charcoal">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    {/* Cinematic Background Image with Slow Zoom */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 20, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={slide.backgroundImageUrl}
                                alt={slide.title}
                                fill
                                className="object-cover object-center"
                                priority
                                sizes="100vw"
                            />
                        </motion.div>
                    </div>

                    {/* Gradient Overlays for Depth and Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-brand-charcoal/30" />
                    <div className="absolute inset-0 bg-brand-charcoal/40" />

                    <div className="container mx-auto px-6 md:px-12 relative z-10 h-full flex items-center">
                        <div className="max-w-5xl pt-20">
                            <motion.div
                                initial={{ opacity: 0, y: 60 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-brand-gold text-[10px] font-bold tracking-[0.3em] mb-10 uppercase">
                                    <Sparkles className="w-3.5 h-3.5 fill-brand-gold" />
                                    <span>The Gharana Standard</span>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8, duration: 1 }}
                                >
                                    <h1 className="text-6xl sm:text-7xl md:text-9xl font-bold text-white mb-10 leading-[0.85] tracking-[-0.05em]">
                                        {slide.title.split(" ").map((word, i) => (
                                            <span key={i} className={cn("block", i === 1 && "text-brand-gold")}>
                                                {word}
                                            </span>
                                        ))}
                                    </h1>
                                </motion.div>

                                <Subheading className="text-white/80 mb-12 max-w-2xl leading-relaxed text-xl md:text-2xl font-light">
                                    {slide.subtitle}
                                </Subheading>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    <Link href={slide.ctaLink || "/products"}>
                                        <Button variant="secondary" size="xl" className="group">
                                            {slide.ctaText}
                                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1.5 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Link href={slide.learnMoreLink || "/offers"}>
                                        <Button variant="glass" size="xl">
                                            Explore Portfolio
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slider Navigation - Refined Minimalist Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-4">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={cn(
                                "h-1.5 transition-all duration-700 rounded-full",
                                i === currentSlide ? "bg-brand-gold w-16" : "bg-white/20 w-8 hover:bg-white/40"
                            )}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Scroll Indicator - Dynamic Line */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-16 right-16 z-20 hidden lg:flex flex-col items-center gap-6"
            >
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em] rotate-90 mb-12">
                    Scroll
                </span>
                <div className="w-[1px] h-32 bg-white/10 relative overflow-hidden">
                    <motion.div
                        animate={{ y: [-128, 128] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-brand-gold to-transparent"
                    />
                </div>
            </motion.div>
        </section>
    );
}
