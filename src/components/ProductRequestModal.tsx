"use client";

import { useState } from "react";
import { X, Send, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createProductRequest, ProductRequestInput } from "@/app/actions/request-actions";
import ImageUpload from "./CloudinaryUpload"; // Reusing existing component if suitable, or wrapping it
// Note: CloudinaryUpload seems to take an `onUpload` callback returning the URL. 
// I'll assume it works like that based on the file name, checking content in next step.

interface ProductRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery?: string;
}

export default function ProductRequestModal({
    isOpen,
    onClose,
    initialQuery = "",
}: ProductRequestModalProps) {
    const [formData, setFormData] = useState<ProductRequestInput>({
        productName: initialQuery,
        brand: "",
        description: "",
        minPrice: undefined,
        maxPrice: undefined,
        imageUrl: "",
        contactInfo: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createProductRequest(formData);
            if (result.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setFormData({
                        productName: "",
                        brand: "",
                        description: "",
                        minPrice: undefined,
                        maxPrice: undefined,
                        imageUrl: "",
                        contactInfo: "",
                    });
                }, 3000);
            } else {
                setError(result.error as string);
            }
        } catch (_err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-brand-blue to-accent p-6 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-brand-gold animate-pulse" />
                                <h2 className="text-xl font-bold font-serif">Genie Request</h2>
                            </div>
                            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6">
                            {isSuccess ? (
                                <div className="text-center py-10">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <Send className="w-10 h-10" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Request Sent!</h3>
                                    <p className="text-gray-600">
                                        Your Genie has received the request.<br />We&apos;ll notify you once we find this product.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.productName}
                                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                            placeholder="e.g. Vintage Leather Jacket"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                            placeholder="e.g. Gucci"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all resize-none"
                                            placeholder="Describe color, size, material, etc."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.minPrice || ""}
                                                onChange={(e) => setFormData({ ...formData, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                placeholder="₹1000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.maxPrice || ""}
                                                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                                placeholder="₹5000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.contactInfo}
                                            onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                            placeholder="Email or Phone Number"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">We&apos;ll contact you when we find it.</p>
                                    </div>

                                    {/* Todo: Add Image Upload here. Will assume CloudinaryUpload exists and we can use it. 
                      For now, leaving placeholder comment to be replaced with actual component integration 
                      once I see the CloudinaryUpload props. */}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Reference Image (Optional)</label>
                                        <ImageUpload
                                            folder="product-requests"
                                            onUpload={(files) => {
                                                if (files.length > 0) {
                                                    setFormData({ ...formData, imageUrl: files[0].url });
                                                }
                                            }}
                                            currentImages={formData.imageUrl ? [formData.imageUrl] : []}
                                            onRemoveImage={() => setFormData({ ...formData, imageUrl: "" })}
                                            maxFiles={1}
                                            accept="image/*"
                                        />
                                    </div>

                                </form>
                            )}
                        </div>

                        {/* Footer */}
                        {!isSuccess && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-brand-blue text-white font-medium rounded-lg shadow-lg shadow-brand-blue/20 hover:bg-brand-dark transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Submit Request
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
