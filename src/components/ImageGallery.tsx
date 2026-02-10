"use client";

import { useState } from "react";
import Image from "next/image";
import { Film, Zap, Play } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
    videoUrl?: string | null;
    productName: string;
    discount?: number;
    isFeatured?: boolean;
}

export default function ImageGallery({
    images,
    videoUrl,
    productName,
    discount = 0,
    isFeatured = false
}: ImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const allMedia = [
        ...images.map(url => ({ type: "image" as const, url })),
        ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : [])
    ];

    const currentMedia = allMedia[activeIndex] || { type: "image", url: "" };

    return (
        <div className="space-y-4">
            {/* Main Display */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex items-center justify-center">
                {currentMedia.type === "image" ? (
                    <Image
                        src={currentMedia.url}
                        alt={productName}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                ) : (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <video
                            src={currentMedia.url}
                            className="max-w-full max-h-full"
                            controls
                            autoPlay
                        />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {discount > 0 && (
                        <span className="bg-brand-lime text-brand-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {discount}% OFF
                        </span>
                    )}
                    {isFeatured && (
                        <span className="bg-brand-dark text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-current" /> Hot
                        </span>
                    )}
                </div>

                {currentMedia.type === "video" && (
                    <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/60 text-white text-[10px] rounded flex items-center gap-1 z-10 font-bold uppercase tracking-widest">
                        <Film className="w-3 h-3" /> Video Mode
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {allMedia.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {allMedia.map((media, index) => (
                        <button
                            key={`${media.url}-${index}`}
                            onClick={() => setActiveIndex(index)}
                            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeIndex === index ? "border-brand-blue shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"
                                }`}
                        >
                            {media.type === "image" ? (
                                <Image
                                    src={media.url}
                                    alt={`${productName} thumbnail ${index}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                    <Film className="w-6 h-6 text-white opacity-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white fill-white opacity-80" />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
