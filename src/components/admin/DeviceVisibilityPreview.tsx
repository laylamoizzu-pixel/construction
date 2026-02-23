"use client";

import { Monitor, Tablet, Smartphone, Eye } from "lucide-react";
import Image from "next/image";

interface DeviceVisibilityPreviewProps {
    imageUrl: string;
    title?: string;
    subtitle?: string;
    overlayOpacity?: number;
}

export default function DeviceVisibilityPreview({
    imageUrl,
    title,
    subtitle,
    overlayOpacity = 0.5,
}: DeviceVisibilityPreviewProps) {
    if (!imageUrl) return null;

    return (
        <div className="space-y-6 mt-4">
            <h3 className="font-semibold text-sm text-gray-500 uppercase flex items-center gap-2">
                <Eye className="w-4 h-4" /> Multi-Device Visibility Preview
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Desktop Preview (21:9ish) */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                            <Monitor className="w-3 h-3" /> Desktop
                        </span>
                        <span className="text-[10px] text-gray-400">Ultra Wide</span>
                    </div>
                    <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-gray-50">
                        <Image
                            src={imageUrl}
                            alt="Desktop preview"
                            fill
                            className="object-cover object-center"
                            unoptimized
                        />
                        <div
                            className="absolute inset-0 bg-black/60"
                            style={{ opacity: overlayOpacity }}
                        />
                        <div className="absolute inset-0 p-4 flex flex-col justify-center">
                            {title && <h4 className="text-[10px] font-bold text-white leading-tight truncate">{title}</h4>}
                            {subtitle && <p className="text-[8px] text-white/70 line-clamp-1">{subtitle}</p>}
                        </div>
                    </div>
                </div>

                {/* Tablet Preview (4:3) */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                            <Tablet className="w-3 h-3" /> Tablet
                        </span>
                        <span className="text-[10px] text-gray-400">iPad Portrait</span>
                    </div>
                    <div className="relative aspect-[3/4] max-w-[180px] mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-gray-50">
                        <Image
                            src={imageUrl}
                            alt="Tablet preview"
                            fill
                            className="object-cover object-center"
                            unoptimized
                        />
                        <div
                            className="absolute inset-0 bg-black/60"
                            style={{ opacity: overlayOpacity }}
                        />
                        <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center">
                            {title && <h4 className="text-[10px] font-bold text-white leading-tight">{title}</h4>}
                            {subtitle && <p className="text-[8px] text-white/70 line-clamp-2 mt-1">{subtitle}</p>}
                        </div>
                    </div>
                </div>

                {/* Mobile Preview (9:16) */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                            <Smartphone className="w-3 h-3" /> Mobile
                        </span>
                        <span className="text-[10px] text-gray-400">iPhone</span>
                    </div>
                    <div className="relative aspect-[9/16] max-w-[140px] mx-auto rounded-lg overflow-hidden border-2 border-gray-800 shadow-xl bg-gray-900 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-b-xl z-20" />
                        <div className="relative w-full h-full rounded-[6px] overflow-hidden">
                            <Image
                                src={imageUrl}
                                alt="Mobile preview"
                                fill
                                className="object-cover object-center"
                                unoptimized
                            />
                            <div
                                className="absolute inset-0 bg-black/60"
                                style={{ opacity: overlayOpacity }}
                            />
                            <div className="absolute inset-0 p-3 flex flex-col justify-center items-center text-center">
                                {title && <h4 className="text-[10px] font-bold text-white leading-tight">{title}</h4>}
                                {subtitle && <p className="text-[8px] text-white/70 line-clamp-3 mt-1">{subtitle}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-[10px] text-amber-800 flex items-center gap-2">
                    <span className="font-bold">Pro Tip:</span>
                    Since we use &quot;object-cover&quot;, your subject should be in the center of the photo to ensure it remains visible on all devices.
                </p>
            </div>
        </div>
    );
}
