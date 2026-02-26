"use client";

import { useState } from "react";
import { getGiftRecommendations } from "@/app/actions/ai-stylist-actions";
import { Loader2, Gift, Heart, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GiftRecommendationResult {
    thoughtProcess: string;
    recommendations: Array<{ item: string; reason: string; category: string }>;
}

export default function GiftConciergeInterface() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GiftRecommendationResult | null>(null);

    const [recipient, setRecipient] = useState({
        relation: "",
        age: "",
        interests: [] as string[],
        occasion: "",
        budget: ""
    });

    const [customInterest, setCustomInterest] = useState("");

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const recommendations = await getGiftRecommendations({
                relation: recipient.relation,
                age: recipient.age,
                interests: recipient.interests,
                occasion: recipient.occasion,
                budget: recipient.budget
            });
            setResult(recommendations);
            setStep(3);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleInterest = (interest: string) => {
        setRecipient(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const addCustomInterest = () => {
        if (customInterest.trim()) {
            toggleInterest(customInterest.trim());
            setCustomInterest("");
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
                        className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100"
                    >
                        <div className="mb-10 text-center">
                            <span className="text-rose-500 font-bold tracking-[0.3em] uppercase text-[10px] block mb-4">AI Gift Concierge</span>
                            <h2 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
                                <Gift className="w-8 h-8 text-rose-500" />
                                I&apos;m Genie.
                            </h2>
                            <p className="text-slate-500 font-light">Tell me about the recipient so I can suggest something perfect.</p>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Relationship</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {["Friend", "Partner", "Parent", "Colleague", "Child", "Sibling"].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setRecipient({ ...recipient, relation: r })}
                                            className={`py-4 rounded-2xl border transition-all font-bold text-[10px] uppercase tracking-widest ${recipient.relation === r
                                                ? "bg-rose-500 text-white border-rose-500 shadow-lg"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-rose-200"
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Recipient Age Bracket</label>
                                <div className="flex gap-4 overflow-x-auto pb-4 justify-center no-scrollbar">
                                    {["0-5", "6-12", "Teens", "20s", "30s", "40s", "50s", "60+"].map((a) => (
                                        <button
                                            key={a}
                                            onClick={() => setRecipient({ ...recipient, age: a })}
                                            className={`flex-shrink-0 px-8 py-4 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-widest whitespace-nowrap ${recipient.age === a
                                                ? "bg-rose-50/50 border-rose-200 text-rose-600"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-rose-200"
                                                }`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!recipient.relation || !recipient.age}
                                className="w-full py-6 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-20 hover:bg-rose-600 transition-all shadow-xl"
                            >
                                Next Step <ChevronRight className="w-4 h-4" />
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
                        className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-10 flex items-center gap-3">
                            <Heart className="w-7 h-7 text-rose-500" />
                            Interests & Vibe
                        </h2>

                        <div className="space-y-12">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Interests</label>
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {["Tech", "Fashion", "Gaming", "Cooking", "Fitness", "Home Decor", "Travel", "Books"].map((i) => (
                                        <button
                                            key={i}
                                            onClick={() => toggleInterest(i)}
                                            className={`px-6 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${recipient.interests.includes(i)
                                                ? "bg-rose-500 text-white border-rose-500 shadow-md"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-rose-200"
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Add custom interest..."
                                        value={customInterest}
                                        onChange={(e) => setCustomInterest(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
                                        className="flex-1 px-6 py-4 rounded-2xl border border-slate-100 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none font-medium"
                                    />
                                    <button
                                        onClick={addCustomInterest}
                                        className="px-8 py-4 bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Occasion</label>
                                    <input
                                        type="text"
                                        placeholder="Birthday, Anniversary, etc."
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none font-medium"
                                        onChange={(e) => setRecipient({ ...recipient, occasion: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Budget ($)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Under $50, $100-200"
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none font-medium"
                                        onChange={(e) => setRecipient({ ...recipient, budget: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 pt-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!recipient.occasion || loading}
                                    className="flex-[2] py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-20 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-rose-200"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Thinking...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5" /> Generate Ideas</>
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
                        className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100"
                    >
                        <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                            <span className="text-rose-400 font-bold tracking-[0.4em] uppercase text-[10px] block mb-4 relative z-10">AI Recommendations</span>
                            <h2 className="text-4xl font-bold mb-4 relative z-10 tracking-tight">The Perfect Gifts.</h2>
                            <p className="text-slate-400 font-light relative z-10">Curated for {recipient.relation} • {recipient.occasion}</p>
                        </div>

                        <div className="p-12">
                            <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100 mb-12">
                                <h3 className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Why these work
                                </h3>
                                <p className="text-slate-700 font-light leading-relaxed italic text-lg">
                                    &quot;{result.thoughtProcess}&quot;
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {result.recommendations.map((rec, i: number) => (
                                    <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-rose-200 hover:bg-white transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <h4 className="font-bold text-xl text-slate-900 group-hover:text-rose-500 transition-colors">{rec.item}</h4>
                                            <span className="px-3 py-1 bg-white text-[9px] font-bold text-slate-400 rounded-full uppercase tracking-wider border border-slate-100">{rec.category}</span>
                                        </div>
                                        <p className="text-slate-500 font-light text-sm mb-6 leading-relaxed">
                                            {rec.reason}
                                        </p>
                                        <button className="text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-2 group/btn">
                                            View Item <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full mt-12 py-5 bg-transparent border-2 border-slate-100 text-slate-400 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                            >
                                Start New Search
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
