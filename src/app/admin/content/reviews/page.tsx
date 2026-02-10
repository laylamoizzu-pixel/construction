"use client";

import { useState, useEffect } from "react";
import { getAllReviews, deleteReview, Review } from "@/app/actions";
import { Trash2, Star, AlertCircle, ExternalLink, MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ReviewsManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        const data = await getAllReviews();
        setReviews(data);
        setLoading(false);
    };

    const handleDelete = async (id: string, productId: string, rating: number) => {
        if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

        setDeletingId(id);
        const result = await deleteReview(id, productId, rating);

        if (result.success) {
            setReviews(reviews.filter(r => r.id !== id));
        } else {
            alert("Failed to delete review");
        }
        setDeletingId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
                    <p className="text-gray-500 mt-1">Monitor and manage customer reviews.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                    Total Reviews: {reviews.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {reviews.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <MessageSquare className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                        <p>When customers leave reviews, they will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition-all group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                                                {review.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-900 block leading-tight">{review.userName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'Unknown Date'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                                                />
                                            ))}
                                            <span className="ml-2 text-sm font-medium text-gray-700">{review.rating}.0</span>
                                        </div>

                                        <p className="text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                            &quot;{review.comment}&quot;
                                        </p>
                                    </div>

                                    {/* Meta & Actions */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        <div className="text-right">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Product</div>
                                            <Link
                                                href={`/products/${review.productId}`}
                                                target="_blank"
                                                className="text-sm font-medium text-brand-blue hover:underline flex items-center gap-1 justify-end"
                                            >
                                                View Product
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                            <div className="text-xs text-gray-400 mt-1 font-mono">{review.productId.slice(0, 8)}...</div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(review.id, review.productId, review.rating)}
                                            disabled={deletingId === review.id}
                                            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                                        >
                                            {deletingId === review.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
