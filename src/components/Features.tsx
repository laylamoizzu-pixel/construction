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
        <section className="py-32 bg-white relative overflow-hidden">
            {/* Subtle light leak for depth */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-blue/5 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
                    <div className="max-w-3xl">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block"
                        >
                            {finalContent.subtitle}
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-black mb-8 tracking-[-0.03em] leading-[1.1]"
                        >
                            {finalContent.title.split('\n').map((line, i) => (
                                <span key={i} className="block last:text-brand-gold">
                                    {line}
                                </span>
                            ))}
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-xl max-w-md pb-2 leading-relaxed font-medium"
                    >
                        {content.description || "Curating excellence in real estate with a focus on modern living and architectural brilliance."}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {finalContent.items.map((item, idx) => {
                        const Icon = iconMap[item.icon] || Package;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative p-10 bg-slate-50 hover:bg-black rounded-[2.5rem] transition-all duration-500 border border-slate-100 hover:border-black shadow-sm hover:shadow-2xl hover:shadow-black/20"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 text-black group-hover:bg-brand-gold group-hover:text-white transition-all duration-500 shadow-sm">
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-white transition-colors duration-500 tracking-tight">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors duration-500">{item.desc}</p>

                                {/* Decorative Arrow */}
                                <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 text-brand-gold">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
