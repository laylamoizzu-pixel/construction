"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, LucideIcon } from "lucide-react";
import { Card } from "./ui/Card";

interface Department {
    id: string;
    title: string;
    description: string;
    image: string;
    icon: string;
    link?: string;
}

interface HighlightsClientProps {
    departments: Department[];
    exploreLabel?: string;
    iconMap: Record<string, LucideIcon>;
}

export default function HighlightsClient({ departments, exploreLabel, iconMap }: HighlightsClientProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {departments.slice(0, 3).map((item, idx) => {
                const Icon = iconMap[item.icon] || Package;

                return (
                    <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Link
                            href={item.link || `/departments#${item.id}`}
                            className="group block h-[650px]"
                        >
                            <Card className="h-full relative overflow-hidden border-none" hover={true}>
                                <div className="absolute inset-0 z-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/20 to-transparent z-10" />
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>

                                <div className="absolute inset-0 p-12 flex flex-col justify-end z-20">
                                    <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8 text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                                        <Icon className="w-7 h-7" />
                                    </div>

                                    <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-white/70 mb-8 line-clamp-2 font-light text-lg">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center text-white font-bold text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        {exploreLabel || "View Projects"} <ArrowRight className="w-5 h-5 ml-3" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}
