"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import ProductRequestModal from "./ProductRequestModal";

interface GenieRequestTriggerProps {
    searchQuery?: string;
}

export default function GenieRequestTrigger({ searchQuery }: GenieRequestTriggerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 px-4 max-w-2xl mx-auto"
            >
                <div className="bg-gradient-to-br from-brand-blue/5 to-accent/5 rounded-3xl p-8 border border-white/50 shadow-xl backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-300">

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-6">
                            <Sparkles className="w-8 h-8 text-brand-gold" />
                        </div>

                        <h3 className="text-2xl font-bold font-serif text-gray-900 mb-3">
                            Couldn't find what you're looking for?
                        </h3>

                        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                            Don't worry! Our <span className="font-semibold text-brand-blue">Genie Service</span> can find it for you. Just tell us what you need, and we'll hunt it down.
                        </p>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group/btn relative px-8 py-4 bg-brand-blue text-white rounded-xl font-medium shadow-lg shadow-brand-blue/25 hover:shadow-brand-blue/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
                            <div className="flex items-center gap-2">
                                <span>Ask Genie to Find It</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                </div>
            </motion.div>

            <ProductRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialQuery={searchQuery}
            />
        </>
    );
}
