"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

// Placeholder images for gallery
const GALLERY_IMAGES = [
    { id: 1, src: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop", category: "Store Interior" },
    { id: 2, src: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop", category: "Fresh Mart" },
    { id: 3, src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", category: "Fashion Studio" },
    { id: 4, src: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2101&auto=format&fit=crop", category: "Tech Zone" },
    { id: 5, src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", category: "Store Exterior" },
    { id: 6, src: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1974&auto=format&fit=crop", category: "Fashion Studio" },
    { id: 7, src: "https://images.unsplash.com/photo-1588965381845-a54b5cc189a5?q=80&w=1974&auto=format&fit=crop", category: "Fresh Mart" },
    { id: 8, src: "https://images.unsplash.com/photo-1472851294608-415522f96385?q=80&w=2070&auto=format&fit=crop", category: "Home & Living" },
];

export default function GalleryPage() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

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
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {GALLERY_IMAGES.map((image, index) => (
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
                                src={image.src}
                                alt={image.category}
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                    <ZoomIn className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-sm font-medium">{image.category}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
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
                        src={GALLERY_IMAGES.find(img => img.id === selectedImage)?.src}
                        alt="Gallery view"
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
