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
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center py-16 px-4 max-w-2xl mx-auto"
            >
                {/* Glassmorphic Container */}
                <div className="group relative rounded-[2rem] p-1 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)]">

                    {/* Border Gradient (Subtle) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-white/60 opacity-50 backdrop-blur-3xl rounded-[2rem] z-0" />

                    {/* Inner Content Container */}
                    <div className="relative z-10 bg-white/40 backdrop-blur-xl rounded-[1.8rem] p-10 border border-white/60 shadow-sm">

                        {/* 3D Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <div className="relative flex flex-col items-center">
                            {/* Icon Container with subtle float animation */}
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="w-16 h-16 bg-gradient-to-tr from-white to-white/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/60 flex items-center justify-center mb-6 backdrop-blur-md"
                            >
                                <Sparkles className="w-7 h-7 text-brand-blue/80" strokeWidth={1.5} />
                            </motion.div>

                            <h3 className="text-3xl font-semibold tracking-tight text-brand-dark mb-4">
                                Can&apos;t find what you need?
                            </h3>

                            <p className="text-slate-600 mb-10 max-w-md mx-auto leading-relaxed text-lg font-light">
                                Let our <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Genie AI</span> search our network to find the perfect property for you.
                            </p>

                            <motion.button
                                onClick={() => setIsModalOpen(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative flex items-center gap-3 px-8 py-4 bg-brand-dark text-white rounded-full font-medium shadow-xl hover:shadow-2xl hover:shadow-brand-blue/20 transition-all duration-300"
                            >
                                <span className="relative z-10 text-[15px] tracking-wide">Ask Genie</span>
                                <div className="relative z-10 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </div>

                                {/* Button sheen effect */}
                                <div className="absolute inset-0 rounded-full overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                                </div>
                            </motion.button>
                        </div>
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
