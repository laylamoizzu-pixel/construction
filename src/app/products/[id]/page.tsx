import { getProduct, getReviews, getCategories, getSiteContent, ProductDetailPageContent, Product } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, Phone, Clock, ShieldCheck, Check, Star } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";
import { Reviews as ReviewsList } from "@/components/Reviews";

import ReviewSummarizer from "@/components/ai/ReviewSummarizer";
import CompareInterface from "@/components/ai/CompareInterface";
import OOSPredictor from "@/components/ai/OOSPredictor";
import RestockTracker from "@/components/ai/RestockTracker";
import DealInsight from "@/components/ai/DealInsight";
import SocialProofBadge from "@/components/ai/SocialProofBadge";
import { Suspense } from "react";
import { getSiteConfig } from "@/app/actions/site-config";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const [product, config] = await Promise.all([getProduct(id), getSiteConfig()]);

    if (!product) {
        return { title: 'Product Not Found' };
    }

    return constructMetadata({
        title: product.name,
        description: product.description.substring(0, 160),
        urlPath: `/products/${id}`,
        imageUrl: product.imageUrl,
        config
    });
}

async function AvailabilitySection({ product }: { product: Product }) {
    const siteContent = await getSiteContent<ProductDetailPageContent>("product-detail-page");

    // Default fallbacks in case content is not set
    const content: ProductDetailPageContent = {
        availabilityText: siteContent?.availabilityText || "Available In-Store Only",
        availabilityBadge: siteContent?.availabilityBadge || "In-Store Only",
        callToActionNumber: siteContent?.callToActionNumber || "+91-9876543210",
        visitStoreLink: siteContent?.visitStoreLink || "/content/contact",
        authenticityTitle: siteContent?.authenticityTitle || "Authenticity Guaranteed",
        authenticityText: siteContent?.authenticityText || "Directly from authorized distributors with full manufacturer warranty.",
        storeLocationTitle: siteContent?.storeLocationTitle || "Store Location",
        storeLocationText: siteContent?.storeLocationText || "Patliputra colony, P&M Mall, Patna",
        storeHoursText: siteContent?.storeHoursText || "Open Daily: 10:00 AM - 9:00 PM"
    };

    return (
        <div className="space-y-8">
            {/* Availability & Store Actions */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-brand-green font-medium">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    {content.availabilityText}
                </div>
                <p className="text-sm text-slate-500">
                    {content.availabilityBadge} - Visit us to experience it firsthand.
                </p>

                {/* Phase 4: Restock Notification */}
                <RestockTracker
                    productName={product.name}
                    stockLevel={product.stockLevel || 0}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                        href={`tel:${content.callToActionNumber}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <Phone className="w-4 h-4" />
                        Call to Check
                    </a>
                    <Link
                        href={content.visitStoreLink}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        <MapPin className="w-4 h-4" />
                        Visit Store
                    </Link>
                </div>
                <div className="pt-2">
                    <CompareInterface currentProduct={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        categoryId: product.categoryId
                    }} />
                </div>
            </div>

            {/* Store Info Snippet */}
            <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl">
                <div className="p-3 bg-brand-blue/10 rounded-lg text-brand-blue">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">{content.authenticityTitle}</h4>
                    <p className="text-sm text-slate-600 mt-1">
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
        <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                Customer Reviews
                <div className="h-px flex-1 bg-slate-100"></div>
            </h2>
            <Suspense fallback={
                <div className="h-48 bg-slate-50 animate-pulse rounded-2xl mb-8 border border-slate-100" />
            }>
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

async function StoreLocationMini() {
    const siteContent = await getSiteContent<ProductDetailPageContent>("product-detail-page");

    const content = {
        storeLocationTitle: siteContent?.storeLocationTitle || "Store Location",
        storeLocationText: siteContent?.storeLocationText || "Patliputra colony, P&M Mall, Patna",
        storeHoursText: siteContent?.storeHoursText || "Open Daily: 10:00 AM - 9:00 PM"
    };

    return (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-dark" />
                {content.storeLocationTitle}
            </h3>
            <div className="aspect-video bg-slate-200 rounded-xl mb-4 overflow-hidden relative">
                {/* Placeholder for map image or embed */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                    Map View
                </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <p dangerouslySetInnerHTML={{ __html: content.storeLocationText.replace(/\n|,/g, '<br/>') }} />
                </div>
                <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                    <p dangerouslySetInnerHTML={{ __html: content.storeHoursText.replace(/\n/g, '<br/>') }} />
                </div>
            </div>
        </div>
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
    const subcategory = product.subcategoryId ? categories.find(c => c.id === product.subcategoryId) : null;

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            {/* Breadcrumb Navigation */}
            <div className="bg-slate-50 border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-7xl py-4">
                    <nav className="flex items-center text-sm text-slate-500 gap-2">
                        <Link href="/" className="hover:text-brand-dark transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <Link href="/products" className="hover:text-brand-dark transition-colors">Products</Link>
                        {category && (
                            <>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                <Link href={`/products?category=${category.id}`} className="hover:text-brand-dark transition-colors">
                                    {category.name}
                                </Link>
                            </>
                        )}
                        {subcategory && (
                            <>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-800 font-medium">{subcategory.name}</span>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Product JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "image": product.images?.length > 0 ? product.images : [product.imageUrl],
                        "description": product.description,
                        "sku": product.id,
                        "offers": {
                            "@type": "Offer",
                            "url": `https://smartavenue99.com/products/${product.id}`,
                            "priceCurrency": "INR",
                            "price": product.price,
                            "itemCondition": "https://schema.org/NewCondition",
                            "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                        },
                        ...(product.reviewCount && product.reviewCount > 0 ? {
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": product.averageRating,
                                "reviewCount": product.reviewCount
                            }
                        } : {})
                    })
                }}
            />

            <main className="container mx-auto px-4 max-w-7xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                    {/* Left Column: Image Gallery */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24">
                            <ImageGallery
                                images={product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : [])}
                                videoUrl={product.videoUrl}
                                productName={product.name}
                                discount={discount}
                                isFeatured={product.featured}
                            />
                        </div>
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            {category && (
                                <Link
                                    href={`/products?category=${category.id}`}
                                    className="text-brand-blue font-bold text-sm uppercase tracking-wider mb-2 inline-block hover:underline"
                                >
                                    {category.name}
                                </Link>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex text-amber-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${star <= Math.round(product.averageRating || 0) ? "fill-current" : "text-slate-200 fill-slate-200"}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-slate-600">
                                    {product.averageRating ? product.averageRating.toFixed(1) : "New"}
                                </span>
                                {product.reviewCount ? (
                                    <span className="text-sm text-slate-400">
                                        ({product.reviewCount} reviews)
                                    </span>
                                ) : null}
                            </div>

                            <div className="mb-6">
                                <SocialProofBadge product={product} />
                            </div>

                            {/* Price Section */}
                            <div className="flex items-end gap-4 border-b border-slate-100 pb-8">
                                <div className="space-y-1">
                                    <span className="text-4xl font-bold text-slate-900 tracking-tight">
                                        ₹{product.price.toLocaleString()}
                                    </span>
                                    {discount > 0 && (
                                        <p className="text-sm text-brand-blue font-medium">
                                            You save ₹{(product.originalPrice! - product.price).toLocaleString()} ({discount}%)
                                        </p>
                                    )}
                                </div>
                                {product.originalPrice && (
                                    <span className="text-xl text-slate-400 line-through mb-1">
                                        ₹{product.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Phase 4: Low Stock Urgency */}
                            <OOSPredictor
                                productName={product.name}
                                sku={product.id}
                                stockLevel={product.stockLevel || 0}
                            />

                            <Suspense fallback={
                                <div className="h-24 bg-slate-50 animate-pulse rounded-xl my-6 border border-slate-100" />
                            }>
                                <DealInsight product={product} />
                            </Suspense>
                        </div>

                        {/* Highlights */}
                        {product.highlights && product.highlights.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-slate-900">Highlights</h3>
                                <ul className="space-y-2">
                                    {product.highlights.map((highlight, index) => (
                                        <li key={index} className="flex items-start gap-3 text-slate-700">
                                            <Check className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Suspense fallback={<div className="h-96 bg-slate-50 animate-pulse rounded-2xl" />}>
                            <AvailabilitySection product={product} />
                        </Suspense>
                    </div>
                </div>

                {/* Detailed Information Tabs/Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Description */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                Product Description
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </h2>
                            <div className="prose prose-lg prose-slate text-slate-600 max-w-none">
                                <p>{product.description}</p>
                            </div>
                        </section>

                        {/* Specifications */}
                        {product.specifications && product.specifications.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    Technical Specifications
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                </h2>
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <tbody>
                                            {product.specifications.map((spec, index) => (
                                                <tr
                                                    key={index}
                                                    className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}
                                                >
                                                    <th className="py-4 px-6 font-medium text-slate-900 w-1/3 border-b border-slate-100 last:border-0">
                                                        {spec.key}
                                                    </th>
                                                    <td className="py-4 px-6 text-slate-600 border-b border-slate-100 last:border-0">
                                                        {spec.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* Reviews */}
                        <Suspense fallback={<div className="h-96 bg-slate-50 animate-pulse rounded-2xl" />}>
                            <ReviewsSection
                                productId={product.id}
                                productName={product.name}
                                averageRating={product.averageRating || 0}
                                reviewCount={product.reviewCount || 0}
                            />
                        </Suspense>
                    </div>

                    {/* Sidebar / Recommendations */}
                    <div className="hidden lg:block lg:col-span-4 space-y-8">
                        {/* Store Location Map Mini */}
                        <Suspense fallback={<div className="h-64 bg-slate-50 animate-pulse rounded-2xl" />}>
                            <StoreLocationMini />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}
