"use client";

import { useState } from "react";
import { getGiftRecommendations } from "@/app/actions/ai-stylist-actions";
import { Loader2, Gift, Heart, User, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GiftConciergeInterface() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

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
            const recommendations = await getGiftRecommendations(recipient);
            setResult(recommendations);
            setStep(3); // Result step
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
                            I'm Genie, your Gift Concierge. Who are we gifting?
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Relationship</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {["Partner", "Parent", "Sibling", "Friend", "Colleague", "Child"].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setRecipient({ ...recipient, relation: r })}
                                            className={`py-3 rounded-xl border ${recipient.relation === r
                                                ? "bg-brand-dark text-white border-brand-dark"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-brand-dark"
                                                } transition-all font-medium`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Age Group</label>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {["Child (0-12)", "Teen (13-19)", "Young Adult (20-30)", "Adult (30-50)", "Senior (50+)"].map((a) => (
                                        <button
                                            key={a}
                                            onClick={() => setRecipient({ ...recipient, age: a })}
                                            className={`flex-shrink-0 px-4 py-3 rounded-xl border ${recipient.age === a
                                                ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-brand-blue"
                                                } transition-all font-medium whitespace-nowrap`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!recipient.relation || !recipient.age}
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
                            <Heart className="w-6 h-6 text-brand-dark" />
                            What do they love?
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Interests & Hobbies</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {["Tech", "Fashion", "Reading", "Travel", "Cooking", "Fitness", "Art", "Music", "Gaming"].map((i) => (
                                        <button
                                            key={i}
                                            onClick={() => toggleInterest(i)}
                                            className={`px-4 py-2 rounded-full border text-sm ${recipient.interests.includes(i)
                                                ? "bg-rose-500 text-white border-rose-500"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-rose-300"
                                                } transition-all`}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add custom interest (e.g. Pottery)"
                                        value={customInterest}
                                        onChange={(e) => setCustomInterest(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
                                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-200 outline-none"
                                    />
                                    <button
                                        onClick={addCustomInterest}
                                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Occasion</label>
                                    <input
                                        type="text"
                                        placeholder="Birthday, Anniversary..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-200 outline-none"
                                        onChange={(e) => setRecipient({ ...recipient, occasion: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
                                    <input
                                        type="text"
                                        placeholder="₹1000 - ₹5000"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-200 outline-none"
                                        onChange={(e) => setRecipient({ ...recipient, budget: e.target.value })}
                                    />
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
                                    disabled={!recipient.occasion || loading}
                                    className="flex-[2] py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all shadow-lg shadow-rose-200"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Thinking...</>
                                    ) : (
                                        <><Gift className="w-5 h-5" /> Find Perfect Gift</>
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
                        <div className="bg-rose-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h2 className="text-3xl font-bold mb-2 relative z-10">Gift Ideas</h2>
                            <p className="text-rose-200 relative z-10">Curated for your {recipient.relation} • {recipient.occasion}</p>
                        </div>

                        <div className="p-8">
                            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mb-8">
                                <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Genie's Thought Process
                                </h3>
                                <p className="text-slate-700 leading-relaxed italic">
                                    "{result.thoughtProcess}"
                                </p>
                            </div>

                            <div className="space-y-4">
                                {result.recommendations.map((rec: any, i: number) => (
                                    <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 hover:border-rose-200 transition-colors shadow-sm group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-rose-600 transition-colors">{rec.item}</h4>
                                            <span className="px-2 py-1 bg-slate-100 text-xs font-bold text-slate-500 rounded uppercase tracking-wider">{rec.category}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-3">
                                            {rec.reason}
                                        </p>
                                        <button className="text-rose-600 text-sm font-bold hover:underline flex items-center gap-1">
                                            Search for similar items <Gift className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full mt-8 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                            >
                                Find Another Gift
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
