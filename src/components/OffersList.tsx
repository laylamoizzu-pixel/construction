"use client";

import { motion } from "framer-motion";
import { Download, ShoppingBag, Clock, Tag } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Offer } from "@/app/actions";

export default function OffersList({ offers }: { offers: Offer[] }) {
    const { config } = useSiteConfig();
    const { contact } = config;

    return (
        <>
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
                {offers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No active offers at the moment. Check back soon!
                    </div>
                ) : (
                    offers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-green-50 border-green-100 border-2 rounded-2xl p-6 flex items-start gap-4 hover:shadow-lg transition-shadow cursor-pointer`}
                        >
                            <div className={`p-3 bg-white rounded-xl shadow-sm text-green-600`}>
                                <Tag className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{offer.title}</h3>
                                    <span className={`px-3 py-1 bg-white rounded-full text-sm font-bold shadow-sm text-green-600`}>
                                        {offer.discount}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">{offer.description}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>Created: {new Date(offer.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-500 mb-4">Want to order directly?</p>
                {contact.whatsappUrl && (
                    <a
                        href={contact.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 inline-flex items-center gap-2"
                    >
                        <ShoppingBag className="w-5 h-5" /> Order via WhatsApp
                    </a>
                )}
            </div>
        </>
    );
}
