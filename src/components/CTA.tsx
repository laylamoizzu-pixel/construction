"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ChatTriggerButton from "@/components/ChatTriggerButton";
import { CTAContent } from "@/app/actions";

import { motion, AnimatePresence } from "framer-motion";

export default function CTA({ content, aiEnabled = true }: { content?: CTAContent; aiEnabled?: boolean }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = useMemo(() => {
        if (!content) return [];
        return content.images && content.images.length > 0
            ? content.images
            : (content.backgroundImage ? [content.backgroundImage] : []);
    }, [content]);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [images]);

    if (!content) {
        return null;
    }

    return (
        <section className="py-32 relative overflow-hidden min-h-[600px] flex items-center bg-black">
            {/* Background Carousel with refined transitions */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    {images.length > 0 ? (
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[currentImageIndex]}
                                alt="Background"
                                fill
                                className="object-cover brightness-[0.4]"
                                priority
                            />
                        </motion.div>
                    ) : (
                        <div className="absolute inset-0 bg-black">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark to-brand-gold opacity-30" />
                        </div>
                    )}
                </AnimatePresence>

                {/* Sophisticated Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl md:text-8xl font-bold text-white mb-10 tracking-[-0.04em] max-w-5xl mx-auto leading-[0.95]">
                        {content.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-white/70 mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
                        {content.text}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href={content.ctaLink || "/products"}
                            className="group relative px-12 py-5 bg-white text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden shadow-2xl shadow-white/10"
                        >
                            <span className="relative z-10">{content.ctaPrimary}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold to-brand-accent opacity-0 group-hover:opacity-20 transition-opacity" />
                        </Link>

                        {content.ctaSecondary === "Chat with Us" && aiEnabled ? (
                            <ChatTriggerButton />
                        ) : (
                            <Link
                                href="/register"
                                className="px-12 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                            >
                                {content.ctaSecondary === "Chat with Us" ? "Register Now" : content.ctaSecondary}
                            </Link>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
