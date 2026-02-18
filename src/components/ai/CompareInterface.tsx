"use client";

import { useState, useEffect } from "react";
import { getComparison, getSimilarProducts } from "@/app/actions/ai-compare-actions";
import { Loader2, Scale, ArrowRightLeft, Check, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CompareInterfaceProps {
    currentProduct: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
        categoryId: string;
    };
}

export default function CompareInterface({ currentProduct }: CompareInterfaceProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Select, 2: Analyze, 3: Result
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    useEffect(() => {
        if (isOpen && step === 1 && similarProducts.length === 0) {
            setLoadingSimilar(true);
            getSimilarProducts(currentProduct.categoryId, currentProduct.id)
                .then(setSimilarProducts)
                .catch(console.error)
                .finally(() => setLoadingSimilar(false));
        }
    }, [isOpen, step, currentProduct]);

    const handleCompare = async (product: any) => {
        setSelectedProduct(product);
        setStep(2);
        try {
            const result = await getComparison(currentProduct.id, product.id);
            setComparison(result);
            setStep(3);
        } catch (error) {
            console.error(error);
            setStep(1); // Reset on error
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
                <ArrowRightLeft className="w-4 h-4 text-brand-blue" />
                Compare
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-blue" />
                        AI Comparison
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <h3 className="text-lg font-semibold mb-4">Select a product to compare with <span className="text-brand-blue">{currentProduct.name}</span></h3>

                                {loadingSimilar ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {similarProducts.map(p => (
                                            <div key={p.id} className="border border-slate-100 rounded-xl p-4 hover:border-brand-blue/50 hover:shadow-md transition-all cursor-pointer group" onClick={() => handleCompare(p)}>
                                                <div className="relative h-40 mb-3 rounded-lg overflow-hidden bg-slate-50">
                                                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                                                <p className="text-brand-dark font-mono mt-1">₹{p.price}</p>
                                                <button className="mt-3 w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                                    Compare
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <Loader2 className="w-12 h-12 animate-spin text-brand-blue mb-6" />
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Products...</h3>
                                <p className="text-slate-500 max-w-md">
                                    Comparing features, specs, and value proposition using DeepSeek reasoning.
                                </p>
                            </motion.div>
                        )}

                        {step === 3 && comparison && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="grid grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-xl">
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 text-center font-bold text-brand-dark">{currentProduct.name}</div>
                                    <div className="col-span-1 text-center font-bold text-slate-600">{selectedProduct.name}</div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {comparison.comparisonPoints.map((point: any, i: number) => (
                                        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4 last:border-0">
                                            <div className="font-semibold text-slate-700 flex items-center gap-2">
                                                <Scale className="w-4 h-4 text-brand-blue/50" />
                                                {point.feature}
                                            </div>
                                            <div className={`p-3 rounded-lg text-sm ${point.verdict.includes("A is better") || point.verdict.includes(currentProduct.name) ? "bg-green-50 text-green-800 border border-green-100" : "bg-slate-50 text-slate-600"}`}>
                                                {point.item1Value}
                                            </div>
                                            <div className={`p-3 rounded-lg text-sm ${point.verdict.includes("B is better") || point.verdict.includes(selectedProduct.name) ? "bg-green-50 text-green-800 border border-green-100" : "bg-slate-50 text-slate-600"}`}>
                                                {point.item2Value}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-6">
                                    <h4 className="font-bold text-amber-800 mb-2">Expert Verdict</h4>
                                    <p className="text-slate-700 italic">{comparison.summary}</p>
                                </div>

                                <div className="p-6 bg-brand-dark text-white rounded-2xl">
                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-brand-lime" /> Recommendation
                                    </h4>
                                    <p className="text-slate-200">{comparison.recommendation}</p>
                                </div>

                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full mt-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Compare Another Product
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
