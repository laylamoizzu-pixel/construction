"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Home, Building2, Trees, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { getVibeFilters } from "@/app/actions/vibe-check-action";

const PROPERTY_VIBES = [
    { id: "luxury", label: "Urban Luxury", icon: Building2 },
    { id: "peace", label: "Suburban Peace", icon: Home },
    { id: "nature", label: "Green Living", icon: Trees },
    { id: "heritage", label: "Vintage Charm", icon: Landmark },
];

export default function PropertyAdvisor() {
    const router = useRouter();
    const [customVibe, setCustomVibe] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVibeCheck = async (vibe: string) => {
        setIsLoading(true);

        const response = await getVibeFilters(vibe);

        if (response.success && response.filters) {
            const params = new URLSearchParams();
            const f = response.filters;

            if (f.searchQuery) params.set("q", f.searchQuery);
            if (f.category) params.set("category", f.category);
            if (f.colors && f.colors.length > 0) params.set("color", f.colors[0]);
            if (f.priceRange?.min) params.set("minPrice", f.priceRange.min.toString());
            if (f.priceRange?.max) params.set("maxPrice", f.priceRange.max.toString());

            router.push(`/products?${params.toString()}`);
        } else {
            console.error("Property Check Failed:", response.error);
            setIsLoading(false);
        }
    };

    return (
        <section className="py-24 bg-brand-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[11px] font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Property Advisor
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-charcoal mb-6">What type of life are you looking to build?</h2>
                    <p className="text-brand-charcoal/60 max-w-2xl mx-auto font-light leading-relaxed">
                        Tell Genie about your ideal living experience, and we&apos;ll match you with properties that fit your vision perfectly.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 border border-brand-charcoal/5 shadow-premium relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        {/* Preset Vibes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {PROPERTY_VIBES.map((v) => (
                                <motion.button
                                    key={v.id}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleVibeCheck(v.label)}
                                    disabled={isLoading}
                                    className={`flex flex-col items-center justify-center p-8 rounded-[2rem] bg-white border border-brand-charcoal/5 shadow-sm hover:border-brand-gold/30 hover:shadow-xl transition-all group ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl mb-6 bg-brand-charcoal/5 text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all duration-500`}>
                                        <v.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-xs uppercase tracking-widest text-brand-charcoal group-hover:text-brand-gold transition-colors">{v.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Custom Vibe Input */}
                        <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-0 sm:p-3 sm:rounded-full bg-white border border-brand-charcoal/10 items-center shadow-lg group focus-within:border-brand-gold/50 transition-all">
                            <input
                                type="text"
                                value={customVibe}
                                onChange={(e) => setCustomVibe(e.target.value)}
                                placeholder="Describe your dream home (e.g., 'A modern villa with plenty of sunlight and a home office')..."
                                className="w-full sm:flex-1 px-8 py-5 sm:py-3 rounded-[2rem] sm:rounded-full bg-transparent text-[15px] text-brand-charcoal placeholder:text-brand-charcoal/30 focus:outline-none font-medium"
                                onKeyDown={(e) => e.key === "Enter" && handleVibeCheck(customVibe)}
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleVibeCheck(customVibe)}
                                disabled={!customVibe.trim() || isLoading}
                                className="w-full sm:w-auto p-5 sm:p-4 bg-brand-charcoal text-white rounded-[2rem] sm:rounded-full hover:bg-brand-gold disabled:opacity-50 transition-all flex items-center justify-center gap-3 sm:px-10 font-bold text-[11px] uppercase tracking-[0.2em]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Search vision
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
