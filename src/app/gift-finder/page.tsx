import GiftConciergeInterface from "@/components/ai/GiftConciergeInterface";
import { Gift } from "lucide-react";

export const dynamic = "force-dynamic";

export default function GiftFinderPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="bg-rose-950 relative overflow-hidden text-white py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-900/50 to-pink-900/50 opacity-50" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-rose-300 text-sm font-bold mb-6 border border-white/10">
                        <Gift className="w-4 h-4" /> Genie AI Gift Concierge
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        Genie: Find the Perfect Gift
                    </h1>
                    <p className="text-xl text-rose-200/80 max-w-2xl mx-auto leading-relaxed">
                        Struggling to find the right gift? Let our AI Concierge analyze your recipient's persona and suggest thoughtful ideas.
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 -mt-10 relative z-20 pb-20">
                <GiftConciergeInterface />
            </main>
        </div>
    );
}
