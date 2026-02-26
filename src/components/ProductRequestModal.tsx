"use client";

import { useState } from "react";
import { X, Send, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createProductRequest, ProductRequestInput } from "@/app/actions/request-actions";
import ImageUpload from "./CloudinaryUpload";

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
                    // Reset after close animation
                    setTimeout(() => {
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
                    }, 500);
                }, 3000);
            } else {
                setError(result.error as string);
                setIsSubmitting(false);
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="relative px-8 pt-8 pb-4 flex justify-between items-start shrink-0 z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-brand-blue fill-brand-blue/20" />
                                    Genie Request
                                </h2>
                                <p className="text-slate-500 text-sm mt-1 font-medium">
                                    Tell us what you need, and we&apos;ll handle the rest.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {isSuccess ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="h-full flex flex-col items-center justify-center py-12 text-center"
                                    >
                                        <div className="w-20 h-20 bg-green-100/50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900">Property Request</h2> Sent!</h3>
                                        <p className="text-gray-500 max-w-xs mx-auto text-base">
                                            Your wish is our command. We&apos;ll notify you as soon as we find your item.
                                        </p>
                                    </motion.div>
                            ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center gap-3 border border-red-100">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span className="font-medium">{error}</span>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    {/* Product Name */}
                                    <div className="group">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Property Type</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.productName}
                                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-2xl transition-all outline-none font-medium placeholder:text-slate-400 text-slate-800"
                                            placeholder="e.g. 3BHK Apartment, Commercial Plot..."
                                        />
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Developer/Builder</label>
                                            <input
                                                type="text"
                                                value={formData.brand}
                                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-2xl transition-all outline-none font-medium text-slate-800"
                                                placeholder="Optional (e.g. Prestige, Sobha)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Contact Info</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.contactInfo}
                                                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-2xl transition-all outline-none font-medium text-slate-800"
                                                placeholder="Email or Phone Number"
                                            />
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Min Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.minPrice || ""}
                                                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                                                    className="w-full pl-8 pr-5 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-2xl transition-all outline-none font-medium text-slate-800"
                                                    placeholder="e.g. 3000000"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Max Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.maxPrice || ""}
                                                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                                                    className="w-full pl-8 pr-5 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-2xl transition-all outline-none font-medium text-slate-800"
                                                    placeholder="Any"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Description</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-2xl transition-all outline-none resize-none font-medium text-slate-800"
                                            placeholder="Details about color, size, material, year, etc."
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Reference Image</label>
                                        <div className="bg-slate-50/50 rounded-2xl p-2 border border-slate-100 hover:border-brand-blue/30 transition-colors">
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
                                                className="[&_button]:w-full [&_button]:py-4 [&_button]:bg-white [&_button]:border-dashed [&_button]:border-2 [&_button]:border-slate-200 [&_button]:text-slate-500 [&_button]:hover:border-brand-blue/50 [&_button]:hover:text-brand-blue [&_button]:transition-all [&_button]:shadow-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-brand-dark text-white font-bold rounded-2xl shadow-lg shadow-brand-dark/20 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        <span>Submit Request</span>
                                    </button>
                                </div>
                            </motion.form>
                                )}
                        </AnimatePresence>
                </div>
                    </motion.div>
                </div >
            )
}
        </AnimatePresence >
    );
}
