import { generateDealExplanation } from "@/lib/llm-service";
import { Sparkles } from "lucide-react";

interface DealExplainerProps {
    product: {
        name: string;
        price: number;
        originalPrice?: number;
        description: string;
    };
}

export default async function DealExplainer({ product }: DealExplainerProps) {
    // If no discount, maybe skip explaining "the deal" unless it's just a great product
    // But let's let the AI decide how to pitch it.

    try {
        const explanation = await generateDealExplanation(product);

        if (!explanation) return null;

        return (
            <div className="bg-gradient-to-r from-brand-blue/5 to-purple-50 rounded-xl p-4 border border-brand-blue/10 my-6">
                <div className="flex gap-3">
                    <div className="bg-white p-2 rounded-full h-fit shadow-sm text-brand-blue">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Smart Deal Insight</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {explanation}
                        </p>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to generate deal explanation:", error);
        return null;
    }
}
