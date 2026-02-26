

import { getProduct, getReviews, getCategories, getSiteContent, ProductDetailPageContent, Product } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, ShieldCheck, Star, Share2, Heart } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";
import { Reviews as ReviewsList } from "@/components/Reviews";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Typography";

import ReviewSummarizer from "@/components/ai/ReviewSummarizer";
import CompareInterface from "@/components/ai/CompareInterface";
import DealInsight from "@/components/ai/DealInsight";
import SocialProofBadge from "@/components/ai/SocialProofBadge";
import { Suspense } from "react";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

async function AvailabilitySection({ product }: { product: Product }) {
    const siteContent = await getSiteContent<ProductDetailPageContent>("product-detail-page");

    const content: ProductDetailPageContent = {
        availabilityText: siteContent?.availabilityText || "Available for Consultation",
        availabilityBadge: siteContent?.availabilityBadge || "Exclusive",
        callToActionNumber: siteContent?.callToActionNumber || "+91-9876543210",
        visitStoreLink: siteContent?.visitStoreLink || "/content/contact",
        authenticityTitle: siteContent?.authenticityTitle || "Gharana Quality Guarantee",
        authenticityText: siteContent?.authenticityText || "Certified construction standards with premium materials and structural warranty.",
        storeLocationTitle: siteContent?.storeLocationTitle || "Experience Center",
        storeLocationText: siteContent?.storeLocationText || "Patliputra colony, P&M Mall, Patna",
        storeHoursText: siteContent?.storeHoursText || "Open Daily: 10:00 AM - 9:00 PM"
    };

    return (
        <div className="space-y-12">
            <Card className="border-none bg-brand-charcoal/[0.03] p-8 rounded-[2.5rem]" hover={false}>
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
                        </span>
                        <span className="text-brand-charcoal font-bold uppercase tracking-widest text-[10px]">
                            {content.availabilityText}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <p className="text-brand-charcoal/40 text-sm font-light leading-relaxed">
                            {content.availabilityBadge} — Schedule a private viewing to experience the architectural precision firsthand.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button variant="primary" className="w-full py-6 text-sm uppercase tracking-[0.2em] font-bold">
                            Request Consultation
                        </Button>
                        <Button variant="outline" className="w-full py-6 text-sm uppercase tracking-[0.2em] font-bold border-brand-charcoal/10">
                            Download Brochure
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-brand-charcoal/5">
                        <CompareInterface currentProduct={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            categoryId: product.categoryId
                        }} />
                    </div>
                </div>
            </Card>

            <div className="flex items-start gap-6 p-8 bg-brand-charcoal text-white rounded-[2.5rem]">
                <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-brand-charcoal" />
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-2">{content.authenticityTitle}</h4>
                    <p className="text-white/40 text-sm font-light leading-relaxed">
                        {content.authenticityText}
                    </p>
                </div>
            </div>
        </div>
    );
}

async function ReviewsSection({ productId, productName, averageRating, reviewCount }: { productId: string, productName: string, averageRating: number, reviewCount: number }) {
    const reviews = await getReviews(productId);

    return (
        <section className="pt-24 border-t border-brand-charcoal/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Feedback</span>
                    <Heading>Resident Voices</Heading>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-3xl font-bold text-brand-charcoal">
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/20">
                            Based on {reviewCount} reviews
                        </div>
                    </div>
                </div>
            </div>

            <Suspense fallback={<div className="h-48 bg-brand-charcoal/5 animate-pulse rounded-[2.5rem] mb-12" />}>
                <ReviewSummarizer productName={productName} reviews={reviews} />
            </Suspense>

            <ReviewsList
                productId={productId}
                reviews={reviews}
                averageRating={averageRating}
                reviewCount={reviewCount}
            />
        </section>
    );
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [product, categories] = await Promise.all([
        getProduct(id),
        getCategories()
    ]);

    if (!product || !product.available) {
        notFound();
    }

    const category = categories.find(c => c.id === product.categoryId);

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-brand-white">
            {/* Immersive Header / Breadcrumb */}
            <div className="pt-32 pb-8 border-b border-brand-charcoal/5">
                <div className="container mx-auto px-6 md:px-12">
                    <nav className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-brand-charcoal/30 gap-4">
                        <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/products" className="hover:text-brand-gold transition-colors">Portfolio</Link>
                        {category && (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-brand-charcoal">{category.name}</span>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-6 md:px-12 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mb-32">
                    {/* Gallery Column */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-32">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <ImageGallery
                                    images={product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : [])}
                                    videoUrl={product.videoUrl}
                                    productName={product.name}
                                    discount={discount}
                                    isFeatured={product.featured}
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Information Column */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                {category && (
                                    <span className="text-brand-gold font-bold text-[10px] uppercase tracking-[0.4em]">
                                        {category.name}
                                    </span>
                                )}
                                <div className="flex gap-4">
                                    <button className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center hover:bg-brand-charcoal/10 transition-colors">
                                        <Heart className="w-4 h-4 text-brand-charcoal" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center hover:bg-brand-charcoal/10 transition-colors">
                                        <Share2 className="w-4 h-4 text-brand-charcoal" />
                                    </button>
                                </div>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold text-brand-charcoal tracking-tighter leading-[0.9]">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-6 pt-4">
                                <SocialProofBadge product={product} />
                                {product.averageRating && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal/[0.03] rounded-full">
                                        <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                                        <span className="text-sm font-bold text-brand-charcoal">{product.averageRating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-12 border-t border-brand-charcoal/5">
                                <div className="flex items-baseline gap-4 mb-2">
                                    <span className="text-5xl font-bold text-brand-charcoal tracking-tight">
                                        ₹{product.price.toLocaleString()}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-2xl text-brand-charcoal/20 line-through font-light">
                                            ₹{product.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {discount > 0 && (
                                    <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">
                                        Legacy Savings — ₹{(product.originalPrice! - product.price).toLocaleString()} Off
                                    </p>
                                )}
                            </div>

                            <Suspense fallback={<div className="h-24 bg-brand-charcoal/5 animate-pulse rounded-2xl" />}>
                                <DealInsight product={product} />
                            </Suspense>
                        </div>

                        {/* Specs Shortlist */}
                        <div className="grid grid-cols-2 gap-4 pb-12 border-b border-brand-charcoal/5">
                            {product.highlights?.slice(0, 4).map((highlight, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-gold" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/60">{highlight}</span>
                                </div>
                            ))}
                        </div>

                        <Suspense fallback={<div className="h-screen bg-brand-charcoal/5 animate-pulse rounded-[2.5rem]" />}>
                            <AvailabilitySection product={product} />
                        </Suspense>
                    </div>
                </div>

                {/* Extended Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                    <div className="lg:col-span-8 space-y-24">
                        <section>
                            <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-6 block">Vision</span>
                            <Heading className="mb-8">Architectural Narrative</Heading>
                            <div className="text-xl text-brand-charcoal/60 font-light leading-relaxed max-w-3xl">
                                {product.description}
                            </div>
                        </section>

                        {product.specifications && product.specifications.length > 0 && (
                            <section>
                                <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-6 block">Specs</span>
                                <Heading className="mb-12">Fine Details</Heading>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                                    {product.specifications.map((spec, index) => (
                                        <div key={index} className="flex justify-between items-center py-4 border-b border-brand-charcoal/5">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/40">{spec.key}</span>
                                            <span className="text-sm font-bold text-brand-charcoal">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <Suspense fallback={<div className="h-screen bg-brand-charcoal/5 animate-pulse rounded-[2.5rem]" />}>
                            <ReviewsSection
                                productId={product.id}
                                productName={product.name}
                                averageRating={product.averageRating || 0}
                                reviewCount={product.reviewCount || 0}
                            />
                        </Suspense>
                    </div>

                    <div className="lg:col-span-4 lg:pt-32">
                        <Card className="bg-brand-charcoal text-white p-12 rounded-[2.5rem] sticky top-32" hover={true}>
                            <MapPin className="w-10 h-10 text-brand-gold mb-8" />
                            <h3 className="text-2xl font-bold mb-4">Location Experience</h3>
                            <p className="text-white/40 text-sm font-light leading-relaxed mb-8">
                                Visit our flagship design studio to view detailed architectural models and material samples.
                            </p>
                            <Button variant="secondary" className="w-full">Get Directions</Button>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
