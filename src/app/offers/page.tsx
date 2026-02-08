"use client";

import { motion } from "framer-motion";
import { Download, ShoppingBag, Clock, Tag } from "lucide-react";

const OFFERS = [
    {
        id: 1,
        title: "Fresh Harvest Festival",
        discount: "Up to 40% OFF",
        desc: "On all organic vegetables and exotic fruits.",
        validity: "Valid till Sunday",
        bg: "bg-green-50 border-green-100",
        iconColor: "text-green-600",
    },
    {
        id: 2,
        title: "Tech Upgrade Sale",
        discount: "Flat 15% OFF",
        desc: "On latest smartphones and smart watches.",
        validity: "Limited time offer",
        bg: "bg-blue-50 border-blue-100",
        iconColor: "text-blue-600",
    },
    {
        id: 3,
        title: "Fashion Clearance",
        discount: "Buy 2 Get 1 Free",
        desc: "On selected international apparel brands.",
        validity: "While stocks last",
        bg: "bg-purple-50 border-purple-100",
        iconColor: "text-purple-600",
    },
    {
        id: 4,
        title: "Home Essentials",
        discount: "Combo Deals",
        desc: "Special prices on kitchenware and decor.",
        validity: "Weekend Special",
        bg: "bg-orange-50 border-orange-100",
        iconColor: "text-orange-600",
    },
];

import { useBranding } from "@/context/branding-context";

export default function OffersPage() {
    const { branding } = useBranding();

    return (
        <div className="bg-white min-h-screen py-20 px-4 md:px-6">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-16">
                    <span className="text-brand-gold font-bold tracking-wider uppercase text-sm mb-2 block">Don&apos;t Miss Out</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">
                        Weekly <span className="text-brand-gold">Smart Deals</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Grab the best offers on premium products. Updated every Monday.
                    </p>
                </div>

                {/* Digital Catalog Banner */}
                <div className="bg-brand-dark rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10 text-center md:text-left">
                        <h2 className="text-3xl font-serif font-bold mb-4">Download Monthly Catalog</h2>
                        <p className="text-gray-300 max-w-md mb-6">
                            View our complete collection of new arrivals, seasonal specials, and exclusive member-only deals in one place.
                        </p>
                        <button className="px-6 py-3 bg-brand-gold text-brand-dark rounded-full font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2 mx-auto md:mx-0">
                            <Download className="w-5 h-5" /> Download PDF (4.5 MB)
                        </button>
                    </div>

                    <div className="relative z-10 w-48 h-64 bg-white/10 backdrop-blur-md rounded-lg rotate-3 border border-white/20 shadow-xl flex items-center justify-center">
                        <span className="text-white/50 font-serif text-2xl rotate-90 whitespace-nowrap">Catalog Preview</span>
                    </div>
                </div>

                {/* Offers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {OFFERS.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${offer.bg} border-2 rounded-2xl p-6 flex items-start gap-4 hover:shadow-lg transition-shadow cursor-pointer`}
                        >
                            <div className={`p-3 bg-white rounded-xl shadow-sm ${offer.iconColor}`}>
                                <Tag className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{offer.title}</h3>
                                    <span className={`px-3 py-1 bg-white rounded-full text-sm font-bold shadow-sm ${offer.iconColor}`}>
                                        {offer.discount}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">{offer.desc}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>{offer.validity}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-500 mb-4">Want to order directly?</p>
                    {branding.whatsappUrl && (
                        <a
                            href={branding.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 inline-flex items-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" /> Order via WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
