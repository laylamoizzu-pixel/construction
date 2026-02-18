import { summarizeReviews } from "@/lib/llm-service";
import { Review } from "@/app/actions";
import { ThumbsUp, ThumbsDown, Bot } from "lucide-react";

interface ReviewSummarizerProps {
    productName: string;
    reviews: Review[];
}

export default async function ReviewSummarizer({ productName, reviews }: ReviewSummarizerProps) {
    if (!reviews || reviews.length < 3) return null;

    try {
        // Take latest 10 reviews max to avoid token limits
        const recentReviews = reviews.slice(0, 10).map(r => ({ rating: r.rating, comment: r.comment }));
        const summary = await summarizeReviews(productName, recentReviews);

        return (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-dark text-white p-1.5 rounded-lg">
                            <Bot className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-800">AI Review Summary</h3>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-200 text-slate-600 rounded">
                        Based on {reviews.length} reviews
                    </span>
                </div>

                <p className="text-slate-700 text-sm mb-6 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    {summary.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 flex items-center gap-2">
                            <ThumbsUp className="w-3 h-3" /> Pros
                        </h4>
                        <ul className="space-y-2">
                            {summary.pros.map((pro, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    {pro}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-2">
                            <ThumbsDown className="w-3 h-3" /> Cons
                        </h4>
                        <ul className="space-y-2">
                            {summary.cons.map((con, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="text-red-400 mt-1">•</span>
                                    {con}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to summarize reviews:", error);
        return null;
    }
}
