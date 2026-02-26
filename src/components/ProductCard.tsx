"use client";

import Link from "next/link";
import Image from "next/image";
import { Zap, Tag, Star, ChevronRight } from "lucide-react";
import { Product, Offer } from "@/app/actions";
import { Card, CardContent } from "./ui/Card";
import SocialProofBadge from "@/components/ai/SocialProofBadge";

interface ProductCardProps {
    product: Product;
    categoryName: string;
    offer?: Offer | null;
    isLast?: boolean;
    lastProductElementRef?: (node: HTMLAnchorElement | null) => void;
}

export const ProductCard = ({
    product,
    categoryName,
    offer,
    isLast,
    lastProductElementRef
}: ProductCardProps) => {
    return (
        <Link
            key={product.id}
            ref={isLast ? lastProductElementRef : null}
            href={`/products/${product.id}`}
            className="group block"
        >
            <Card className="h-full flex flex-col border-none bg-white p-2" hover={true}>
                {/* Image Section */}
                <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-brand-charcoal/5">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.featured && (
                            <span className="px-3 py-1 bg-brand-charcoal text-brand-gold text-[10px] font-bold rounded-full flex items-center gap-2 shadow-premium backdrop-blur-md">
                                <Zap className="w-3 h-3 fill-brand-gold" /> FEATURED
                            </span>
                        )}
                        {offer && (
                            <span className="px-3 py-1 bg-brand-gold text-brand-charcoal text-[10px] font-bold rounded-full flex items-center gap-2 shadow-premium animate-pulse">
                                <Tag className="w-3 h-3" /> {offer.discount}
                            </span>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-end">
                        <SocialProofBadge product={product} compact={true} />
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">
                            {categoryName}
                        </span>
                        {product.averageRating ? (
                            <div className="flex items-center gap-1.5 text-brand-charcoal font-bold text-xs">
                                <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                                {product.averageRating.toFixed(1)}
                            </div>
                        ) : null}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-brand-charcoal mb-3 line-clamp-1 group-hover:text-brand-gold transition-colors duration-300">
                        {product.name}
                    </h3>

                    <p className="text-brand-charcoal/40 text-sm line-clamp-2 mb-6 font-light leading-relaxed">
                        {product.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-brand-silver/30">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30 mb-1">
                                Investment
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-brand-charcoal">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-sm text-brand-charcoal/30 line-through font-light">
                                        ₹{product.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="w-12 h-12 rounded-full border border-brand-silver/50 flex items-center justify-center text-brand-charcoal group-hover:bg-brand-charcoal group-hover:text-white transition-all duration-500">
                            <ChevronRight className="w-6 h-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};
