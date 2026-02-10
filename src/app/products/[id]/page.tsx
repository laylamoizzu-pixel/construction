import { getProduct, getReviews } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Truck, ShieldCheck } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";
import { Reviews } from "@/components/Reviews";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Ensure fresh data on every request

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [product, reviews] = await Promise.all([
        getProduct(id),
        getReviews(id)
    ]);

    if (!product) {
        notFound();
    }

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Breadcrumb / Back */}
                <Link
                    href="/products"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-dark mb-8 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <ImageGallery
                            images={product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : [])}
                            videoUrl={product.videoUrl}
                            productName={product.name}
                            discount={discount}
                            isFeatured={product.featured}
                        />
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-2">
                            <span className="text-brand-blue font-bold text-sm uppercase tracking-wider">
                                {product.categoryId} {/* Using ID for now, ideally fetch category name */}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold text-brand-dark mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline gap-4 mb-6">
                            <span className="text-3xl font-bold text-brand-dark">
                                ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                                <span className="text-xl text-slate-400 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div className="prose prose-slate mb-8 text-slate-600">
                            <p>{product.description}</p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100">
                                <Truck className="w-5 h-5 text-brand-blue shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm text-brand-dark">Store Pickup</h4>
                                    <p className="text-xs text-slate-500 mt-1">Available at P&M Mall</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100">
                                <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm text-brand-dark">Warranty</h4>
                                    <p className="text-xs text-slate-500 mt-1">1 year official warranty</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="max-w-4xl mx-auto">
                    <Reviews
                        productId={product.id}
                        reviews={reviews}
                        averageRating={product.averageRating}
                        reviewCount={product.reviewCount}
                    />
                </div>
            </div>
        </div>
    );
}
