import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ChatTriggerButton from "@/components/ChatTriggerButton";
import { CTAContent } from "@/app/actions";

export default function CTA({ content }: { content?: CTAContent }) {
    const defaultContent: CTAContent = {
        title: "Ready to experience the new standard?",
        text: "Join thousands of smart shoppers transforming their lifestyle with Smart Avenue.",
        ctaPrimary: "Browse Catalog",
        ctaSecondary: "Chat with Us",
        backgroundImage: "" // Default gradient used
    };

    const finalContent = content || defaultContent;

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-dark">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-lime/20 mix-blend-overlay" />
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/30 via-transparent to-transparent opacity-50" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight max-w-4xl mx-auto">
                    {finalContent.title}
                </h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                    {finalContent.text}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/products"
                        className="px-8 py-4 bg-brand-lime hover:bg-lime-400 text-brand-dark font-bold rounded-full transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]"
                    >
                        {finalContent.ctaPrimary} <ArrowRight className="w-5 h-5" />
                    </Link>
                    {/* Secondary Action - dynamic check if it's "Chat with Us" or a link */}
                    {finalContent.ctaSecondary === "Chat with Us" ? (
                        <ChatTriggerButton />
                    ) : (
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-full transition-all"
                        >
                            {finalContent.ctaSecondary}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
