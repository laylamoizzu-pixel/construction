import StylistInterface from "@/components/ai/StylistInterface";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function StylistPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="bg-brand-dark relative overflow-hidden text-white py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/30 to-purple-600/30 opacity-50" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-brand-lime text-sm font-bold mb-6 border border-white/10">
                        <Sparkles className="w-4 h-4" /> AI-Powered
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        Your Genie Personal AI Stylist
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Get personalized outfit recommendations tailored to your vibe, occasion, and budget. Powered by advanced fashion reasoning.
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 -mt-10 relative z-20 pb-20">
                <StylistInterface />
            </main>
        </div>
    );
}
