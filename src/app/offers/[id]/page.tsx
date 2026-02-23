import { getOffer } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, Zap } from "lucide-react";


export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const [offer, config] = await Promise.all([getOffer(id), getSiteConfig()]);

    if (!offer) {
        return { title: "Offer Not Found" };
    }

    return constructMetadata({
        title: offer.title,
        description: offer.description.substring(0, 160),
        urlPath: `/offers/${id}`,
        config
    });
}

// Client wrapper for WhatsApp button since it needs context
import WhatsAppButton from "./WhatsAppButton";

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const offer = await getOffer(id);

    if (!offer) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Link */}
                <Link href="/offers" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-blue mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Weekly Offers</span>
                </Link>

                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
                    {/* Header Section */}
                    <div className="bg-brand-dark p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-brand-lime/20 opacity-30" />
                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
                        />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-lime/20 border border-brand-lime/30 text-brand-lime text-xs font-bold tracking-widest mb-6 uppercase">
                                <Zap className="w-3 h-3" /> Exclusive Privilege
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                                {offer.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-brand-dark rounded-2xl font-black text-xl shadow-lg shadow-brand-lime/20">
                                    <Tag className="w-6 h-6" />
                                    {offer.discount}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 font-medium">
                                    <Clock className="w-5 h-5 text-brand-blue" />
                                    <span>Posted on {new Date(offer.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-12">
                        <div className="prose prose-lg prose-slate max-w-none mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                Offer Description
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {offer.description}
                            </p>
                        </div>

                        {/* CTA Section */}
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Claim This Offer</h3>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                Want to take advantage of this exclusive deal? Contact our concierge team directly on WhatsApp for immediate assistance.
                            </p>

                            <WhatsAppButton />
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 px-8 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                        * Terms and conditions apply. Offers subject to stock availability.
                    </p>
                </div>
            </div>
        </div>
    );
}
