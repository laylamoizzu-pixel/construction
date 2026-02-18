"use client";

import { useState, useEffect } from "react";
import { Eye, TrendingUp } from "lucide-react";
import { getOOSUrgency, OOSUrgencyResult } from "@/app/actions/proactive-alerts-action";

interface OOSPredictorProps {
    productName: string;
    sku: string;
    stockLevel: number;
}

export default function OOSPredictor({ productName, sku, stockLevel }: OOSPredictorProps) {
    const [urgencyData, setUrgencyData] = useState<OOSUrgencyResult["data"] | null>(null);

    useEffect(() => {
        // Only fetch urgency if stock is low (1-5 units)
        if (stockLevel > 0 && stockLevel <= 5) {
            const fetchUrgency = async () => {
                try {
                    const result = await getOOSUrgency(productName, sku, stockLevel);
                    if (result.success && result.data) {
                        setUrgencyData(result.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch urgency data", err);
                } finally {
                }
            };
            fetchUrgency();
        }
    }, [productName, sku, stockLevel]);

    if (!urgencyData || stockLevel > 5 || stockLevel === 0) return null;

    const urgencyColors = {
        high: "bg-red-50 border-red-200 text-red-800",
        medium: "bg-orange-50 border-orange-200 text-orange-800",
        low: "bg-yellow-50 border-yellow-200 text-yellow-800"
    };

    const iconColors = {
        high: "text-red-500",
        medium: "text-orange-500",
        low: "text-yellow-500"
    };

    return (
        <div className={`mt-4 p-3 rounded-lg border ${urgencyColors[urgencyData.urgencyLevel]} flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`p-1.5 bg-white rounded-full shadow-sm ${iconColors[urgencyData.urgencyLevel]}`}>
                <TrendingUp className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                    {urgencyData.headline}
                    <span className="inline-flex items-center px-2 py-0.5 rounded textxs font-medium bg-white/50 animate-pulse">
                        <Eye className="w-3 h-3 mr-1" /> Live
                    </span>
                </h4>
                <p className="text-xs mt-1 opacity-90">
                    {urgencyData.subtext}
                </p>
            </div>
        </div>
    );
}
