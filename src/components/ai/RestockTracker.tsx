"use client";

import { useState } from "react";
import { Bell, Check, Loader2, Mail } from "lucide-react";
import { subscribeToRestock, RestockSubscriptionResult } from "@/app/actions/proactive-alerts-action";

interface RestockTrackerProps {
    productName: string;
    stockLevel: number;
}

export default function RestockTracker({ productName, stockLevel }: RestockTrackerProps) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [demoNotification, setDemoNotification] = useState<RestockSubscriptionResult["demoNotification"] | null>(null);

    // Only show if out of stock
    if (stockLevel > 0) return null;

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await subscribeToRestock(productName, email);
            if (result.success) {
                setIsSubscribed(true);
                setDemoNotification(result.demoNotification);
            }
        } catch (err) {
            console.error("Subscription failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (isSubscribed) {
        return (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in zoom-in-50 duration-300">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                        <Check className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-green-900">You're on the list!</h4>
                        <p className="text-sm text-green-700">We'll alert you efficiently.</p>
                    </div>
                </div>

                {demoNotification && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">AI Generated Preview</p>
                        <div className="text-sm text-slate-800">
                            <p className="font-medium mb-1">Subject: {demoNotification.subject}</p>
                            <p className="text-slate-600 leading-relaxed">"{demoNotification.body}"</p>
                            {demoNotification.discountCode && (
                                <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded border border-green-200 border-dashed">
                                    Code: {demoNotification.discountCode}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-full shadow-sm text-slate-400">
                    <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">Out of Stock</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Demand is high. Get notified strictly when it's back.
                    </p>

                    <form onSubmit={handleSubscribe} className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Notify Me"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
