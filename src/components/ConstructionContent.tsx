"use client";

import { motion } from "framer-motion";
import { Hammer, Ruler, HardHat, Compass, Layers, ShieldCheck, CheckCircle2, Zap, Sun } from "lucide-react";
import { Heading } from "./ui/Typography";
import { Button } from "./ui/Button";
import Image from "next/image";
import { cn } from "@/lib/utils";

const timelineSteps = [
    {
        title: "Architectural Planning",
        desc: "Collaboration with world-class architects to create structural blueprints that merge aesthetic soul with engineering precision.",
        icon: Compass,
        status: "Phase 01"
    },
    {
        title: "Strategic Foundation",
        desc: "Rigorous soil testing and heavy piling using high-grade materials to ensure a lifetime of structural stability.",
        icon: Layers,
        status: "Phase 02"
    },
    {
        title: "Reinforced Structure",
        desc: "Precision casting of columns and slabs using premium reinforced concrete, audited for maximum durability.",
        icon: Hammer,
        status: "Phase 03"
    },
    {
        title: "Mechanical & Finishing",
        desc: "Integration of smart-home wiring, high-pressure plumbing, and hand-picked premium finishes for luxury living.",
        icon: Zap,
        status: "Phase 04"
    },
    {
        title: "Final Certification",
        desc: "A 200-point structural and finishing audit followed by a seamless digital handover of all documentation.",
        icon: ShieldCheck,
        status: "Phase 05"
    }
];

const constructionServices = [
    {
        title: "Structural Auditing",
        desc: "Technical health checks for existing structures to ensure longevity and safety.",
        icon: Ruler
    },
    {
        title: "Luxury Turnkey Projects",
        desc: "From blueprint to handover, we manage every facet of your premium construction.",
        icon: HardHat
    },
    {
        title: "Sustainable Building",
        desc: "Green materials and solar-integrated designs for an eco-conscious footprint.",
        icon: Sun
    }
];

export default function ConstructionContent() {
    return (
        <div className="bg-brand-white min-h-screen">
            {/* Cinematic Hero */}
            <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-brand-charcoal">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop"
                        alt="Construction Site"
                        fill
                        className="object-cover opacity-40 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/40 to-transparent" />
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-3xl space-y-8"
                    >
                        <span className="text-brand-gold font-bold tracking-[0.5em] uppercase text-[10px] block">Engineering Legacy</span>
                        <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.85]">
                            Precision <br />
                            <span className="text-brand-gold">Redefined.</span>
                        </h1>
                            We don&apos;t just build homes. We engineer benchmarks of structural integrity and architectural soul.
                        <div className="pt-8 flex gap-6">
                            <Button className="bg-brand-gold text-white px-10 h-14 rounded-full text-[10px] uppercase tracking-widest border-none hover:bg-white hover:text-brand-charcoal transition-all">
                                Request Audit
                            </Button>
                            <Button variant="outline" className="text-white border-white/20 px-10 h-14 rounded-full text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                                View Process
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Service Pillars */}
            <section className="py-32 container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {constructionServices.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-12 rounded-[3rem] bg-white border border-brand-charcoal/5 shadow-premium hover:border-brand-gold/30 transition-all duration-700 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-brand-charcoal/5 flex items-center justify-center mb-8 group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                                <service.icon className="w-6 h-6 text-brand-gold group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">{service.title}</h3>
                            <p className="text-brand-charcoal/40 font-light leading-relaxed">{service.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* The Timeline Section */}
            <section className="py-32 bg-brand-charcoal text-white overflow-hidden relative">
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-32 space-y-6">
                        <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">The Construction Journey</span>
                        <Heading className="text-white">Our 5-Stage Blueprint.</Heading>
                        <p className="text-white/40 font-light leading-relaxed">
                            From the first soil test to the final walkthrough, our process is optimized for transparency, speed, and uncompromising quality.
                        </p>
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Central Line */}
                        <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

                        <div className="space-y-32">
                            {timelineSteps.map((step, idx) => {
                                const isOdd = idx % 2 !== 0;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        className={cn(
                                            "relative flex flex-col md:flex-row items-start md:items-center gap-12 md:gap-24",
                                            isOdd ? "md:flex-row-reverse" : ""
                                        )}
                                    >
                                        {/* Content Area */}
                                        <div className={cn(
                                            "w-full md:w-1/2 space-y-4",
                                            isOdd ? "md:text-left" : "md:text-right"
                                        )}>
                                            <span className="text-brand-gold font-bold tracking-[0.2em] uppercase text-[10px]">
                                                {step.status}
                                            </span>
                                            <h3 className="text-3xl font-bold tracking-tight">{step.title}</h3>
                                            <p className="text-white/40 font-light leading-relaxed max-w-md ml-auto mr-auto md:ml-0 md:mr-0">
                                                {step.desc}
                                            </p>
                                        </div>

                                        {/* Central Node */}
                                        <div className="absolute left-0 md:left-1/2 top-0 md:top-auto w-14 h-14 rounded-full bg-brand-charcoal border-4 border-brand-gold flex items-center justify-center -translate-x-[27px] md:-translate-x-1/2 z-20 shadow-[0_0_30px_rgba(197,160,89,0.3)]">
                                            <step.icon className="w-6 h-6 text-brand-gold" />
                                        </div>

                                        {/* Empty Side for Spacing */}
                                        <div className="hidden md:block w-1/2" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality Commitment Section */}
            <section className="py-32">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1504307651254-35680f356bf2?q=80&w=1974&auto=format&fit=crop"
                                alt="Quality Audit"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] block">Standard Excellence</span>
                                <Heading>The Gharana <br /> Structural Covenant.</Heading>
                                    We use the highest grade of materials and advanced modular construction techniques to ensure that our projects aren&apos;t just homes—they&apos;re generational assets.
                            </div>

                            <div className="space-y-6">
                                {[
                                    "Rigorous structural health audits every 30 days.",
                                    "Premium high-grade reinforced concrete standards.",
                                    "Fire safety and earthquake-resilient engineering.",
                                    "Zero-compromise material sourcing policy."
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <div className="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                                        </div>
                                        <p className="text-brand-charcoal font-medium">{item}</p>
                                    </div>
                                ))}
                            </div>

                            <Button className="h-16 px-12 rounded-full bg-brand-charcoal text-white hover:bg-brand-gold transition-all text-[10px] uppercase tracking-widest font-bold">
                                Download Technical Brochure
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 bg-brand-gold relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 py-20"
                    style={{ backgroundImage: "radial-gradient(circle at center, #000 1px, transparent 1px)", backgroundSize: "64px 64px" }}
                />
                <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold text-brand-charcoal tracking-tighter mb-12">
                        Start Your Project <br /> With Gharana.
                    </h2>
                    <Button size="lg" className="bg-brand-charcoal text-white hover:bg-white hover:text-brand-charcoal h-16 px-12 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all transform hover:scale-105">
                        Consult Our Engineers
                    </Button>
                </div>
            </section>
        </div>
    );
}
