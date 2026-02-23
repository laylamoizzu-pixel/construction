"use client";

import { motion } from "framer-motion";
import { Download, MessageSquare, Clock, Tag, Zap, ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Offer } from "@/app/actions";
import Link from "next/link";

export default function OffersList({ offers, catalogueUrl, catalogueTitle, catalogueSubtitle }: { offers: Offer[], catalogueUrl?: string, catalogueTitle?: string, catalogueSubtitle?: string }) {
    const { config } = useSiteConfig();
    const { contact } = config;

    return (
        <>
            {/* Digital Catalog Banner - Tech Style */}
            <div className="bg-brand-dark rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-lime/20 opacity-30 group-hover:opacity-40 transition-opacity" />
                {/* Animated Grid Background */}
                <div className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                        backgroundSize: "20px 20px"
                    }}
                />

                <div className="relative z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/20 border border-brand-lime/30 text-brand-lime text-xs font-bold tracking-wide mb-4 uppercase">
                        <Zap className="w-3 h-3" /> New Edition Available
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                        {catalogueTitle || <>Smart Catalog <span className="text-brand-lime">Vol. 4</span></>}
                    </h2>
                    <p className="text-slate-300 max-w-md mb-8 leading-relaxed">
                        {catalogueSubtitle || "Access our complete digital inventory, exclusive bundles, and member pricing."}
                    </p>
                    {catalogueUrl ? (
                        <a href={catalogueUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-brand-lime text-brand-dark rounded-full font-bold hover:bg-lime-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(132,204,22,0.5)]">
                            <Download className="w-5 h-5" /> Download PDF
                        </a>
                    ) : (
                        <button disabled className="px-8 py-4 bg-gray-600 text-gray-400 rounded-full font-bold cursor-not-allowed flex items-center justify-center gap-3">
                            <Download className="w-5 h-5" /> Catalogue Unavailable
                        </button>
                    )}
                </div>

                {/* Abstract Visual */}
                <div className="relative z-10 hidden md:block">
                    <div className="w-64 h-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transform rotate-6 hover:rotate-3 transition-transform duration-500 shadow-2xl flex flex-col">
                        <div className="w-full h-4 bg-white/10 rounded-full mb-4" />
                        <div className="w-2/3 h-4 bg-white/10 rounded-full mb-8" />
                        <div className="flex-1 bg-gradient-to-br from-brand-blue/20 to-transparent rounded-xl flex items-center justify-center">
                            <span className="text-6xl font-black text-white/5">04</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {offers.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <Tag className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Offers</h3>
                        <p className="text-slate-500">Check back later for new exclusive deals.</p>
                    </div>
                ) : (
                    offers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-brand-lime/30 group"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <span className="px-4 py-2 bg-brand-lime/10 text-brand-dark rounded-full text-sm font-bold border border-brand-lime/20 group-hover:bg-brand-lime group-hover:text-brand-dark transition-colors">
                                        {offer.discount}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-brand-dark mb-3 group-hover:text-brand-blue transition-colors">
                                    {offer.title}
                                </h3>

                                <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed">
                                    {offer.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <Link
                                        href={`/offers/${offer.id}`}
                                        className="text-brand-dark font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                    >
                                        Details <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="mt-24 text-center">
                <p className="text-slate-400 mb-6 font-medium">Prefer instant assistance?</p>
                {contact.whatsappUrl && (
                    <a
                        href={contact.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded-full font-bold hover:bg-[#128C7E] transition-colors shadow-lg shadow-[#25D366]/30 hover:scale-105 transform duration-300"
                    >
                        <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                    </a>
                )}
            </div>
        </>
    );
}
