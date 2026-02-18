import { generateSocialProof } from "@/lib/llm-service";
import { TrendingUp } from "lucide-react";

interface SocialProofProps {
    product: {
        name: string;
        categoryId: string;
        tags: string[];
    };
    variant?: "card" | "badge";
}

export default async function SocialProof({ product, variant = "badge" }: SocialProofProps) {
    try {
        // Mock sales stats for now to give the AI something to work with
        // In a real app, we would fetch this from an analytics service
        const mockStats = {
            salesInLastMonth: Math.floor(Math.random() * 50) + 10,
            popularInCity: ["Mumbai", "Delhi", "Bangalore", "Pune"][Math.floor(Math.random() * 4)]
        };

        const proof = await generateSocialProof(product, mockStats);

        if (!proof) return null;

        if (variant === "card") {
            return (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-xs font-medium text-amber-800">
                    <TrendingUp className="w-3 h-3" />
                    {proof}
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue/80 mt-2">
                <TrendingUp className="w-3 h-3" />
                {proof}
            </div>
        );

    } catch (error) {
        console.error("Failed to generate social proof:", error);
        return null;
    }
}
