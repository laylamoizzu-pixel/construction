"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, PartyPopper, Briefcase, Coffee, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { getVibeFilters } from "@/app/actions/vibe-check-action";

const VIBES = [
    { id: "party", label: "Weekend Party", icon: PartyPopper, color: "bg-purple-100 text-purple-600" },
    { id: "work", label: "Office Chic", icon: Briefcase, color: "bg-blue-100 text-blue-600" },
    { id: "chill", label: "Sunday Chill", icon: Coffee, color: "bg-amber-100 text-amber-600" },
    { id: "date", label: "Date Night", icon: Heart, color: "bg-rose-100 text-rose-600" },
];

export default function VibeSelector() {
    const router = useRouter();
    const [selectedVibe, setSelectedVibe] = useState("");
    const [customVibe, setCustomVibe] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVibeCheck = async (vibe: string) => {
        setIsLoading(true);
        setSelectedVibe(vibe);

        const response = await getVibeFilters(vibe);

        if (response.success && response.filters) {
            const params = new URLSearchParams();
            const f = response.filters;

            if (f.searchQuery) params.set("q", f.searchQuery);
            if (f.category) params.set("category", f.category);
            if (f.colors && f.colors.length > 0) params.set("color", f.colors[0]); // Simple single color for now
            if (f.priceRange?.min) params.set("minPrice", f.priceRange.min.toString());
            if (f.priceRange?.max) params.set("maxPrice", f.priceRange.max.toString());
            // We could add a 'reasoning' param to show a banner on the results page?
            // params.set("vibeReason", f.reasoning);

            router.push(`/products?${params.toString()}`);
        } else {
            console.error("Vibe Check Failed:", response.error);
            setIsLoading(false);
        }
    };

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-medium mb-3">
                        <Sparkles className="w-4 h-4" />
                        AI Personal Stylist
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Shop by Vibe</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Don't know what to search for? Tell our AI your mood or occasion, and we'll curate the perfect collection.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden">
                    {/* Decorative background blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        {/* Preset Vibes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {VIBES.map((v) => (
                                <motion.button
                                    key={v.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleVibeCheck(v.label)}
                                    disabled={isLoading}
                                    className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <div className={`p-3 rounded-full mb-3 ${v.color}`}>
                                        <v.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium text-slate-900">{v.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Custom Vibe Input */}
                        <div className="bg-white p-2 rounded-full shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center">
                            <input
                                type="text"
                                value={customVibe}
                                onChange={(e) => setCustomVibe(e.target.value)}
                                placeholder="Or describe your own vibe (e.g., 'Camping in the mountains', '90s Retro')..."
                                className="flex-1 px-6 py-3 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                onKeyDown={(e) => e.key === "Enter" && handleVibeCheck(customVibe)}
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleVibeCheck(customVibe)}
                                disabled={!customVibe.trim() || isLoading}
                                className="p-3 bg-brand-dark text-white rounded-full hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2 px-6 font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Curating...
                                    </>
                                ) : (
                                    <>
                                        Find Vibe
                                        <ArrowRight className="w-5 h-5" />
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
