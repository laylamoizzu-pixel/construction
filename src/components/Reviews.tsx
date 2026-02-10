"use client";

import { useState } from "react";
import { Star, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { addReview, Review } from "@/app/actions";
import { useRouter } from "next/navigation";

interface ReviewsProps {
    productId: string;
    reviews: Review[];
    averageRating?: number;
    reviewCount?: number;
}

export function Reviews({ productId, reviews, averageRating = 0, reviewCount = 0 }: ReviewsProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // Use user's name or fallback to "User" if not available in auth context (depends on auth provider)
            // Ideally auth context should provide display name. For now using email part or "Verified User"
            const userName = user.email ? user.email.split("@")[0] : "Verified User";

            const result = await addReview(productId, user.uid, userName, rating, comment);

            if (result.success) {
                setRating(0);
                setComment("");
                router.refresh();
            } else {
                setError(result.error as string);
            }
        } catch (_) {
            setError("Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Customer Reviews</h2>

            {/* Summary */}
            <div className="flex items-center gap-4 mb-8 p-6 bg-slate-50 rounded-xl">
                <div className="text-center">
                    <div className="text-4xl font-bold text-brand-dark">{averageRating.toFixed(1)}</div>
                    <div className="flex text-yellow-400 my-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(averageRating) ? "fill-current" : "text-slate-300"}`}
                            />
                        ))}
                    </div>
                    <div className="text-xs text-slate-500">{reviewCount} Reviews</div>
                </div>
                <div className="h-12 w-px bg-slate-200 mx-4" />
                <div className="flex-1">
                    {/* Can add rating distribution bars here later */}
                    <p className="text-slate-500 text-sm">Share your thoughts with other customers</p>
                </div>
            </div>

            {/* Write Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-10 border-b border-slate-100 pb-10">
                    <h3 className="font-bold text-lg mb-4">Write a Review</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`w-6 h-6 transition-colors ${star <= (hoverRating || rating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-slate-300"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all resize-none h-32"
                            placeholder="What did you like or dislike?"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-brand-dark text-white font-bold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            ) : (
                <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-6 mb-10 text-center">
                    <p className="text-brand-dark font-medium mb-2">Please log in to write a review</p>
                    <button
                        onClick={() => router.push('/login?redirect=' + window.location.pathname)}
                        className="text-brand-blue font-bold hover:underline"
                    >
                        Log In Now
                    </button>
                </div>
            )}

            {/* Review List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-slate-900">{review.userName}</span>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                                </span>
                            </div>
                            <div className="flex text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-slate-200"}`}
                                    />
                                ))}
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
