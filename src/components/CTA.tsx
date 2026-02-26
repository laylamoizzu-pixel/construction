"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ChatTriggerButton from "@/components/ChatTriggerButton";
import { CTAContent } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Heading, Subheading } from "./ui/Typography";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

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
        }, 8000);

        return () => clearInterval(interval);
    }, [images]);

    if (!content) {
        return null;
    }

    return (
        <section className="py-40 relative overflow-hidden min-h-[700px] flex items-center bg-brand-charcoal">
            {/* Background Carousel with refined zoom */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    {images.length > 0 ? (
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[currentImageIndex]}
                                alt="Background"
                                fill
                                className="object-cover brightness-[0.3]"
                                priority
                            />
                        </motion.div>
                    ) : (
                        <div className="absolute inset-0 bg-brand-charcoal" />
                    )}
                </AnimatePresence>

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-brand-charcoal" />
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Heading className="text-white text-5xl md:text-8xl mb-8 max-w-5xl mx-auto leading-[0.95]">
                        {content.title}
                    </Heading>
                    <Subheading className="text-white/60 mb-14 max-w-2xl mx-auto text-xl md:text-2xl font-light">
                        {content.text}
                    </Subheading>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href={content.ctaLink || "/products"}>
                            <Button variant="secondary" size="xl" className="group">
                                {content.ctaPrimary}
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1.5 transition-transform" />
                            </Button>
                        </Link>

                        {content.ctaSecondary === "Chat with Us" && aiEnabled ? (
                            <ChatTriggerButton />
                        ) : (
                            <Link href="/register">
                                <Button variant="glass" size="xl">
                                    {content.ctaSecondary === "Chat with Us" ? "Register Now" : content.ctaSecondary}
                                </Button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
