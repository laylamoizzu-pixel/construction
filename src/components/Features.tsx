import { CheckCircle2, ShieldCheck, Zap, Globe, LucideIcon, Package, Star, Heart, TrendingUp } from "lucide-react";
import { FeaturesContent } from "@/app/actions";

const iconMap: Record<string, LucideIcon> = {
    ShieldCheck,
    Zap,
    Globe,
    CheckCircle2,
    Package,
    Star,
    Heart,
    TrendingUp
};

export default function Features({ content }: { content?: FeaturesContent }) {
    if (!content || !content.items || content.items.length === 0) {
        return null;
    }

    const finalContent = content;

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <span className="text-brand-lime font-bold tracking-widest uppercase text-xs mb-2 block">
                            {finalContent.subtitle}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6 tracking-tight">
                            {finalContent.title.split('\n').map((line, i) => (
                                <span key={i} className="block">
                                    {i === 1 ? (
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-lime">
                                            {line}
                                        </span>
                                    ) : (
                                        line
                                    )}
                                </span>
                            ))}
                            {/* Fallback if no newline split (backward compatibility/simplicity) */}
                            {finalContent.title.indexOf('\n') === -1 && (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-lime">
                                    {/* If single line, just show it - styling might be slightly different but functional */}
                                </span>
                            )}
                        </h2>
                    </div>
                    <p className="text-slate-500 text-lg max-w-md pt-4">
                        {content.description || "We bridge the gap between modern designs and local expertise, bringing you a curated selection of world-class properties right at your fingertips."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {finalContent.items.map((item, idx) => {
                        const Icon = iconMap[item.icon] || Package;

                        return (
                            <div key={idx} className="group p-8 bg-slate-50 hover:bg-brand-dark rounded-2xl transition-all duration-300 border border-slate-100 hover:border-brand-dark">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 text-brand-blue group-hover:bg-white/10 group-hover:border-white/10 group-hover:text-brand-lime transition-all">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-3 group-hover:text-white transition-colors">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{item.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
