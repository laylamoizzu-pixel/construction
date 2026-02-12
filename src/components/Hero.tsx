"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { HeroContent } from "@/app/actions";
import { useSiteConfig } from "@/context/SiteConfigContext";

const DEFAULT_HERO = {
    title: "Experience the Future of Retail",
    subtitle: "Curated premium essentials available at our exclusive location.",
    ctaText: "View Collection",
    ctaLink: "/products",
    backgroundImageUrl: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=2695&auto=format&fit=crop",
    overlayOpacity: 0.5,
};

export default function Hero({ content }: { content?: HeroContent }) {
    const { config } = useSiteConfig();

    // Mapping content (Action Type) to Config (Context Type)
    // Priority: Content (Specific) > SiteConfig (Global) > Default
    const title = content?.title || config?.hero?.title || DEFAULT_HERO.title;
    const subtitle = content?.subtitle || config?.hero?.subtitle || DEFAULT_HERO.subtitle;

    // Handle type mismatch between HeroContent (ctaPrimary) and SiteConfig (ctaText)
    const ctaText = content?.ctaPrimary || config?.hero?.ctaText || DEFAULT_HERO.ctaText;
    const ctaLink = config?.hero?.ctaLink || DEFAULT_HERO.ctaLink;

    // Handle type mismatch for background image
    const bgImage = content?.backgroundImage || config?.hero?.backgroundImageUrl || DEFAULT_HERO.backgroundImageUrl;
    const overlayOpacity = config?.hero?.overlayOpacity ?? DEFAULT_HERO.overlayOpacity;

    return (
        <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden bg-brand-dark">
            {/* Background Image with optimized loading */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] animate-slow-zoom"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            {/* Modern Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
            <div
                className="absolute inset-0 bg-brand-blue/10 mix-blend-overlay"
                style={{ opacity: overlayOpacity }}
            />

            <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-brand-lime text-xs font-medium tracking-wide mb-6 uppercase">
                            <Sparkles className="w-3 h-3" />
                            <span>Smart Avenue 99</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                            {title.split(" ").map((word, i) => (
                                <span key={i} className={i === 1 ? "text-gradient block" : "block"}>
                                    {word}{" "}
                                </span>
                            ))}
                        </h1>

                        <p className="text-lg md:text-2xl text-slate-300 mb-10 font-light max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={ctaLink}>
                                <button className="group relative px-8 py-4 bg-brand-blue hover:bg-sky-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-brand-blue/25 hover:shadow-brand-blue/40 flex items-center gap-2">
                                    {ctaText}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/offers">
                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-medium backdrop-blur-md transition-all">
                                    Learn More
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-t from-brand-lime/20 to-transparent blur-[120px] pointer-events-none" />
        </section>
    );
}
