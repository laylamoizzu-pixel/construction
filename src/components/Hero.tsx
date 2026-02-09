"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { HeroContent } from "@/app/actions";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function Hero({ content }: { content: HeroContent | null }) {
    const { config } = useSiteConfig();

    // Priority: SiteConfig > Props > Defaults
    const title = config.hero.title || content?.title || "Experience International Retail";
    const subtitle = config.hero.subtitle || content?.subtitle || "Premium groceries, fashion, and lifestyle products delivered to your doorstep.";
    const tagline = content?.tagline || config.branding.tagline || "Smart Avenue: Where Luxury Meets Convenience";
    const ctaText = config.hero.ctaText || content?.ctaPrimary || "Shop Now";
    const ctaLink = config.hero.ctaLink || "/departments";
    const backgroundImage = config.hero.backgroundImageUrl || content?.backgroundImage;
    const overlayOpacity = config.hero.overlayOpacity ?? 0.6; // Default to 0.6 if not set

    return (
        <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-brand-green/20 z-10 mix-blend-multiply" />
                <div className="w-full h-full bg-slate-900 relative">
                    {backgroundImage && (
                        <Image
                            src={backgroundImage}
                            alt="Hero Background"
                            fill
                            className="object-cover"
                            style={{ opacity: 1 - overlayOpacity }}
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: overlayOpacity }} />
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-20 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-gold text-sm font-medium tracking-wide mb-6">
                        {tagline}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                        {title}
                        <br />
                        <span className="text-brand-gold">{subtitle}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
                        We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, durable plasticware, quality crockery, cosmetics, premium stationery, soft toys, and thoughtfully curated gift items—bringing comfort, convenience, and elegance to everyday living.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={ctaLink}
                            className="px-8 py-4 bg-brand-gold hover:bg-yellow-500 text-brand-dark font-semibold rounded-full transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                        >
                            {ctaText}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/offers"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full transition-all"
                        >
                            View Offers
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
