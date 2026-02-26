"use client";

import { useState } from "react";
import { getGiftRecommendations } from "@/app/actions/ai-stylist-actions"; // Note: Reusing action temporarily, would ideally rename action file too
import { Loader2, Building, Heart, MapPin, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectRecommendationResult {
    thoughtProcess: string;
    recommendations: Array<{ item: string; reason: string; category: string }>;
}

export default function ProjectFinder() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ProjectRecommendationResult | null>(null);

    const [requirements, setRequirements] = useState({
        intent: "", // Investment vs Personal
        size: "", // Studio, 2BHK, etc.
        features: [] as string[],
        location: "",
        budget: ""
    });

    const [customFeature, setCustomFeature] = useState("");

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Re-mapping real estate terms to original recipient structure for action compatibility
            const recommendations = await getGiftRecommendations({
                relation: requirements.intent,
                age: requirements.size,
                interests: requirements.features,
                occasion: requirements.location,
                budget: requirements.budget
            });
            setResult(recommendations);
            setStep(3);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeature = (feature: string) => {
        setRequirements(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const addCustomFeature = () => {
        if (customFeature.trim()) {
            toggleFeature(customFeature.trim());
            setCustomFeature("");
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key="step1"
                        className="bg-white rounded-[3rem] p-12 shadow-premium border border-brand-charcoal/5"
                    >
                        <div className="mb-10 text-center">
                            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] block mb-4">Project Discovery</span>
                            <h2 className="text-4xl font-bold text-brand-charcoal mb-4 flex items-center justify-center gap-3">
                                <Building className="w-8 h-8 text-brand-gold" />
                                Welcome. I&apos;m Genie.
                            </h2>
                            <p className="text-brand-charcoal/40 font-light">Tell me about your property goals so I can find the perfect match.</p>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <label className="block text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-6 text-center">Your Primary Goal</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {["Personal Home", "High-Yield Investment", "Weekend Retreat", "Commercial Venture"].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setRequirements({ ...requirements, intent: r })}
                                            className={`py-6 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${requirements.intent === r
                                                ? "bg-brand-charcoal text-white border-brand-charcoal shadow-lg"
                                                : "bg-white border-brand-charcoal/5 text-brand-charcoal/40 hover:border-brand-gold/50"
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-6 text-center">Preferred Configuration</label>
                                <div className="flex gap-4 overflow-x-auto pb-4 justify-center no-scrollbar">
                                    {["Studio / 1BHK", "Luxury 2BHK", "Executive 3BHK", "Premium Penthouse", "Plot / Land"].map((a) => (
                                        <button
                                            key={a}
                                            onClick={() => setRequirements({ ...requirements, size: a })}
                                            className={`flex-shrink-0 px-8 py-4 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-widest whitespace-nowrap ${requirements.size === a
                                                ? "bg-brand-gold/10 border-brand-gold text-brand-gold"
                                                : "bg-white border-brand-charcoal/5 text-brand-charcoal/40 hover:border-brand-gold/30"
                                                }`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!requirements.intent || !requirements.size}
                                className="w-full py-6 bg-brand-charcoal text-white rounded-full font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-20 hover:bg-brand-gold transition-all shadow-xl"
                            >
                                Continue Discovery <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        key="step2"
                        className="bg-white rounded-[3rem] p-12 shadow-premium border border-brand-charcoal/5"
                    >
                        <h2 className="text-3xl font-bold text-brand-charcoal mb-10 flex items-center gap-3">
                            <Heart className="w-7 h-7 text-brand-gold" />
                            Define your essentials.
                        </h2>

                        <div className="space-y-12">
                            <div>
                                <label className="block text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-6">Lifestyle Enhancements</label>
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {["Smart Home", "Solar Integrated", "Home Theatre", "Private Gym", "Eco-friendly", "Security First", "EV Charging", "Pet Friendly"].map((i) => (
                                        <button
                                            key={i}
                                            onClick={() => toggleFeature(i)}
                                            className={`px-6 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${requirements.features.includes(i)
                                                ? "bg-brand-gold text-white border-brand-gold shadow-md"
                                                : "bg-white border-brand-charcoal/5 text-brand-charcoal/40 hover:border-brand-gold/50"
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Add custom requirement..."
                                        value={customFeature}
                                        onChange={(e) => setCustomFeature(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomFeature()}
                                        className="flex-1 px-6 py-4 rounded-2xl border border-brand-charcoal/5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none font-medium"
                                    />
                                    <button
                                        onClick={addCustomFeature}
                                        className="px-8 py-4 bg-brand-charcoal/5 text-brand-charcoal text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-brand-charcoal hover:text-white transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> Preferred Zone
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="City center, quiet suburbs..."
                                        className="w-full px-6 py-4 rounded-2xl border border-brand-charcoal/5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none font-medium"
                                        onChange={(e) => setRequirements({ ...requirements, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-4">Capital Allocation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ₹75L - ₹1.5Cr"
                                        className="w-full px-6 py-4 rounded-2xl border border-brand-charcoal/5 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none font-medium"
                                        onChange={(e) => setRequirements({ ...requirements, budget: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 pt-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-5 bg-brand-charcoal/5 text-brand-charcoal rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-brand-charcoal/10 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!requirements.location || loading}
                                    className="flex-[2] py-5 bg-brand-gold text-white rounded-full font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-gold/20"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing data...</>
                                    ) : (
                                        <><Building className="w-5 h-5" /> Generate Matching Projects</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && result && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        key="step3"
                        className="bg-white rounded-[3rem] overflow-hidden shadow-premium border border-brand-charcoal/5"
                    >
                        <div className="bg-brand-charcoal p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                            <span className="text-brand-gold font-bold tracking-[0.4em] uppercase text-[10px] block mb-4 relative z-10">AI Recommendations</span>
                            <h2 className="text-4xl font-bold mb-4 relative z-10 tracking-tight">Your Custom Portfolio.</h2>
                            <p className="text-white/40 font-light relative z-10">Curated for {requirements.intent} • {requirements.location}</p>
                        </div>

                        <div className="p-12">
                            <div className="bg-brand-gold/5 p-8 rounded-3xl border border-brand-gold/10 mb-12">
                                <h3 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Strategic Insights
                                </h3>
                                <p className="text-brand-charcoal font-light leading-relaxed italic text-lg">
                                    &quot;{result.thoughtProcess}&quot;
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {result.recommendations.map((rec, i: number) => (
                                    <div key={i} className="p-8 bg-white rounded-3xl border border-brand-charcoal/5 hover:border-brand-gold/30 hover:shadow-xl transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <h4 className="font-bold text-xl text-brand-charcoal group-hover:text-brand-gold transition-colors">{rec.item}</h4>
                                            <span className="px-3 py-1 bg-brand-charcoal/5 text-[9px] font-bold text-brand-charcoal/50 rounded-full uppercase tracking-wider">{rec.category}</span>
                                        </div>
                                        <p className="text-brand-charcoal/40 font-light text-sm mb-6 leading-relaxed">
                                            {rec.reason}
                                        </p>
                                        <button className="text-brand-gold text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-2 group/btn">
                                            Explore Similar Projects <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full mt-12 py-5 bg-transparent border-2 border-brand-charcoal/5 text-brand-charcoal/40 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-brand-charcoal hover:text-white hover:border-brand-charcoal transition-all"
                            >
                                Start New Discovery
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
