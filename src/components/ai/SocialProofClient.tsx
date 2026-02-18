"use client";

import { useEffect, useState } from "react";
import { fetchSocialProof } from "@/app/actions/ai-actions";
import { TrendingUp } from "lucide-react";

interface SocialProofClientProps {
    product: {
        id: string; // Used for caching key if needed
        name: string;
        categoryId: string;
        tags: string[];
    };
    className?: string;
}

export default function SocialProofClient({ product, className = "" }: SocialProofClientProps) {
    const [proof, setProof] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Small random delay to prevent all cards flashing at once and to stagger LLM calls
        const delay = Math.random() * 2000;

        const load = async () => {
            await new Promise(r => setTimeout(r, delay));
            if (!mounted) return;

            // In a real app, check localStorage/sessionStorage cache first
            const result = await fetchSocialProof(product);
            if (mounted) {
                setProof(result);
                setLoading(false);
            }
        };

        load();

        return () => { mounted = false; };
    }, [product]); // reduced deps

    if (loading) return null; // Don't show anything while loading to keep UI clean
    if (!proof) return null;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50/80 backdrop-blur-sm border border-amber-100/50 rounded-full text-[10px] font-bold text-amber-800 shadow-sm animate-in fade-in zoom-in duration-500 ${className}`}>
            <TrendingUp className="w-3 h-3" />
            <span className="line-clamp-1 max-w-[150px]">{proof}</span>
        </div>
    );
}
