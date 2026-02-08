"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Globe, Heart, ShieldCheck } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative py-24 bg-brand-dark text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif font-bold mb-6"
                    >
                        Smart Avnue – <span className="text-brand-gold">Premium & Affordable</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-300 max-w-3xl mx-auto"
                    >
                        Making everyday essentials look better, feel better, and last longer. Quality and elegance within everyone’s reach.
                    </motion.p>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-20 container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-3xl font-serif font-bold text-brand-dark mb-6">Our Vision & Mission</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            At Smart Avnue, we believe that quality, style, and affordability should go hand in hand. Our mission is to redefine retail shopping by offering well-designed, long-lasting, and functional products that enhance everyday life while remaining budget-friendly.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We continuously update our product range to match current trends, customer needs, and modern lifestyles, ensuring that every visit to Smart Avnue feels fresh, valuable, and satisfying.
                        </p>
                    </div>
                    <div className="flex-1 h-[400px] w-full bg-slate-100 rounded-2xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center hover:scale-105 transition-transform duration-700" />
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-brand-dark mb-4">Core Values</h2>
                        <p className="text-gray-500">The pillars that define the Smart Avenue experience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Quality Assurance",
                                desc: "100% genuine products, sourced directly from brands.",
                                color: "text-blue-600 bg-blue-50"
                            },
                            {
                                icon: Globe,
                                title: "Global Standards",
                                desc: "International shopping ambiance and service protocols.",
                                color: "text-purple-600 bg-purple-50"
                            },
                            {
                                icon: Heart,
                                title: "Customer First",
                                desc: "Valet parking, lounge access, and premium hospitality.",
                                color: "text-red-600 bg-red-50"
                            },
                            {
                                icon: CheckCircle2,
                                title: "Integrity",
                                desc: "Transparent billing and honest pricing, always.",
                                color: "text-green-600 bg-green-50"
                            },
                        ].map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`w-12 h-12 rounded-full ${value.color} flex items-center justify-center mb-6`}>
                                    <value.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
