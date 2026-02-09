"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { GalleryImage } from "@/app/actions";

interface GalleryClientProps {
    initialImages: GalleryImage[];
}

export default function GalleryClient({ initialImages }: GalleryClientProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="bg-white py-20 min-h-screen">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4">
                        A Glimpse of <span className="text-brand-gold">Smart Avenue</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Experience the ambiance, the aisles, and the architecture that makes us Patna&apos;s premier shopping destination.
                    </p>
                </div>

                {/* Gallery Grid */}
                {initialImages.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl">
                        <p className="text-gray-500 text-lg">Our gallery is being curated. Check back soon!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {initialImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in shadow-md hover:shadow-xl transition-all"
                                onClick={() => setSelectedImage(image.id)}
                            >
                                <img
                                    src={image.imageUrl}
                                    alt="Gallery Image"
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                        <ZoomIn className="w-6 h-6" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full">
                        <X className="w-8 h-8" />
                    </button>

                    <motion.img
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={initialImages.find(img => img.id === selectedImage)?.imageUrl}
                        alt="Gallery view"
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
