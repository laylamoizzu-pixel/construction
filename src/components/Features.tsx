"use client";

import { CheckCircle2, ShieldCheck, Zap, Globe, LucideIcon, Package, Star, Heart, TrendingUp } from "lucide-react";
import { FeaturesContent } from "@/app/actions";
import { motion } from "framer-motion";
import { SectionTitle } from "./ui/Typography";
import { Card, CardContent } from "./ui/Card";

const iconMap: Record<string, LucideIcon> = {
    ShieldCheck,
    Zap,
    Globe,
    CheckCircle2,
    Package,
    Star,
    Heart,
    TrendingUp
};

export default function Features({ content }: { content?: FeaturesContent }) {
    if (!content || !content.items || content.items.length === 0) {
        return null;
    }

    return (
        <section className="py-40 bg-brand-white relative overflow-hidden">
            {/* Ambient luxury glow */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-gold/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
                    <div className="max-w-4xl">
                        <SectionTitle subtitle={content.subtitle || "Performance"}>
                            The Engineering Soul.
                        </SectionTitle>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-brand-charcoal/50 text-xl max-w-md pb-4 leading-relaxed font-light"
                    >
                        {content.description || "Defining the future of luxury construction with precision engineering and timeless design."}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {content.items.map((item, idx) => {
                        const Icon = iconMap[item.icon] || Package;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Card
                                    className="p-2 bg-white/50 border-brand-silver/30 h-full group hover:border-brand-gold/30 transition-all duration-700 hover:shadow-2xl"
                                >
                                    <CardContent className="p-10">
                                        <div className="w-14 h-14 rounded-xl bg-brand-charcoal flex items-center justify-center mb-8 text-brand-gold shadow-premium group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-brand-charcoal mb-4 tracking-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-brand-charcoal/60 leading-relaxed font-normal">
                                            {item.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </SpotlightCard>
    );
}
