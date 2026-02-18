"use client";

import { useState } from "react";
import { getStylistAdvice } from "@/app/actions/ai-stylist-actions";
import { Loader2, Shirt, Sparkles, User, Palette, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StylistAdviceResult {
    advice: string;
    suggestedOutfit: {
        top?: string;
        bottom?: string;
        shoes?: string;
        accessory?: string;
        reasoning: string;
        [key: string]: string | undefined;
    };
}


export default function StylistInterface() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<StylistAdviceResult | null>(null);

    const [preferences, setPreferences] = useState({
        gender: "",
        style: "",
        occasion: "",
        budget: "",
        colors: [] as string[]
    });

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const advice = await getStylistAdvice(preferences);
            setResult(advice);
            setStep(3); // Result step
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleColor = (color: string) => {
        setPreferences(prev => ({
            ...prev,
            colors: prev.colors.includes(color)
                ? prev.colors.filter(c => c !== color)
                : [...prev.colors, color]
        }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="step1"
                        className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="w-6 h-6 text-brand-dark" />
                            I&apos;m Genie, your Stylist. Tell me about yourself.
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Gender</label>
                                <div className="flex gap-3">
                                    {["Male", "Female", "Non-binary"].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setPreferences({ ...preferences, gender: g })}
                                            className={`flex-1 py-3 rounded-xl border ${preferences.gender === g
                                                ? "bg-brand-dark text-white border-brand-dark"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-brand-dark"
                                                } transition-all font-medium`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Style Vibe</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Minimalist", "Streetwear", "Classic", "Bohemian", "Professional", "Avant-Garde"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setPreferences({ ...preferences, style: s })}
                                            className={`py-3 rounded-xl border ${preferences.style === s
                                                ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-brand-blue"
                                                } transition-all font-medium`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!preferences.gender || !preferences.style}
                                className="w-full py-4 bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 transition-colors mt-4"
                            >
                                Next Step <User className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="step2"
                        className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-brand-dark" />
                            The Occasion
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">What is this outfit for?</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Wedding guest, Job Interview, First Date, Beach Vacation..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                    onChange={(e) => setPreferences({ ...preferences, occasion: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Preferred Colors (Optional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Black", "White", "Navy", "Beige", "Red", "Green", "Pastel"].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => toggleColor(c)}
                                            className={`px-4 py-2 rounded-full border text-sm ${preferences.colors.includes(c)
                                                ? "bg-slate-800 text-white border-slate-800"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                                                } transition-all`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!preferences.occasion || loading}
                                    className="flex-[2] py-4 bg-gradient-to-r from-brand-blue to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all shadow-lg"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Styling...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5" /> Curate My Look</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key="step3"
                        className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
                    >
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h2 className="text-3xl font-bold mb-2 relative z-10">Your Curated Look</h2>
                            <p className="text-slate-300 relative z-10">Styled by AI • {preferences.style} • {preferences.occasion}</p>
                        </div>

                        <div className="p-8">
                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-8">
                                <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Genie&apos;s Stylist Notes
                                </h3>
                                <p className="text-slate-700 leading-relaxed italic">
                                    &quot;{result.advice}&quot;
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {Object.entries(result.suggestedOutfit).map(([key, value]) => {
                                    if (key === "reasoning") return null;
                                    return (
                                        <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">{key}</span>
                                            <span className="font-semibold text-slate-900 block">{value as string}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Why this works</span>
                                <p className="text-sm text-slate-600">
                                    {result.suggestedOutfit.reasoning}
                                </p>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full mt-8 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                            >
                                Style Another Look
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
