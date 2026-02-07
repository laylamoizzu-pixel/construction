"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-brand-green/20 z-10 mix-blend-multiply" />
                {/* Placeholder for video/image - using a solid color for now, replaced by actual asset later */}
                <div className="w-full h-full bg-slate-900">
                    {/* In a real scenario, this would be <video> or <Image> */}
                    <div className="w-full h-full object-cover opacity-60 bg-[url('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-20 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-gold text-sm font-medium tracking-wide mb-6">
                        Patna&apos;s Premier Shopping Destination
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
                        Experience World-Class <br />
                        <span className="text-brand-gold">Retail Luxury</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        From fresh gourmet groceries to premium fashion and smart electronics.
                        Discover a shopping experience like never before, right here in your city.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/departments"
                            className="px-8 py-4 bg-brand-gold hover:bg-yellow-500 text-brand-dark font-semibold rounded-full transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                        >
                            Explore Collections
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/offers"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full transition-all"
                        >
                            View Weekly Offers
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
