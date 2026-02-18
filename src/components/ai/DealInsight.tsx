"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Info } from "lucide-react";
import { getDealInsight } from "@/app/actions/conversion-boosters-action";

interface DealInsightProps {
    product: {
        id: string;
        name: string;
        price: number;
        originalPrice?: number;
        description: string;
    };
    discount: number;
}

export default function DealInsight({ product, discount }: DealInsightProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple caching key
        const cacheKey = `deal_insight_${product.id}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            setInsight(cached);
            setLoading(false);
            return;
        }

        const fetchInsight = async () => {
            const res = await getDealInsight(product);
            if (res.success && res.insight) {
                setInsight(res.insight);
                sessionStorage.setItem(cacheKey, res.insight);
            }
            setLoading(false);
        };

        fetchInsight();
    }, [product]);

    if (loading) return <div className="h-6 w-3/4 bg-slate-100 animate-pulse rounded mt-2"></div>;
    if (!insight) return null;

    return (
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
            <div className="bg-orange-100 p-1.5 rounded-full mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-800 leading-snug">
                    {insight}
                </p>
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] uppercase font-bold text-orange-400">Smart Analysis</span>
                </div>
            </div>
        </div>
    );
}
