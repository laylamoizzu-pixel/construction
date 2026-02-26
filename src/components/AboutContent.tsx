"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Globe, ShieldCheck, Users, Zap, TrendingUp, MapPin, Phone, Mail, Clock, Check, Star, Heart, Award } from "lucide-react";
import Image from "next/image";
import { AboutPageContent, ContactContent } from "@/app/actions";
import { Heading } from "./ui/Typography";

const iconMap: Record<string, React.ElementType> = {
    CheckCircle2, Globe, ShieldCheck, Users, Zap, TrendingUp, MapPin, Phone, Mail, Clock, Check, Star, Heart, Award
};

export default function AboutContent({ content, contact }: { content: AboutPageContent | null, contact: ContactContent | null }) {
    const data = content || {
        heroTitle: "Gharana Realtors",
        heroSubtitle: "Redefining the standard of premium living in the modern age.",
        heroImage: "",
        visionTitle: "A Legacy in Every Foundation",
        visionText1: "We are more than a construction firm; we are a design ecosystem where architectural precision meets regional soul. Gharana Realtors was born from a vision to bring world-class standards to our local communities.",
        visionText2: "Every project we undertake is a commitment to durability, aesthetics, and the emotional impact of space. We don't just build homes; we craft the backdrops for your life's most significant moments.",
        visionImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
        heroLabel: "The Narrative",
        visionLabel: "Our Philosphy",
        statsCustomers: "10k+",
        statsCustomersLabel: "Curated Lives",
        statsSatisfaction: "98%",
        statsSatisfactionLabel: "Approval Excellence",
        contactTitle: "The Studio",
        contactSubtitle: "Visit our experience center to witness architectural models and material swatches.",
        valuesTitle: "The Gharana Covenant",
        valuesSubtitle: "Four pillars that define our commitment to your future.",
        values: [
            {
                title: "Architectural Integrity",
                desc: "Rigorous structural audits and premium material selection as standard.",
                icon: "ShieldCheck",
                color: "text-brand-gold"
            },
            {
                title: "Local Heritage",
                desc: "Deep respect for regional aesthetics blended with modern functionality.",
                icon: "Globe",
                color: "text-brand-gold"
            },
            {
                title: "Precision Engineering",
                desc: "Advanced construction techniques ensuring timely, perfect possession.",
                icon: "Zap",
                color: "text-brand-gold"
            },
            {
                title: "Radical Transparency",
                desc: "An open-book policy on progress, materials, and pricing.",
                icon: "CheckCircle2",
                color: "text-brand-gold"
            }
        ]
    };

    return (
        <div className="bg-brand-white min-h-screen">
            {/* Cinematic Hero */}
            <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-brand-charcoal">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-charcoal/40 to-brand-charcoal z-10" />
                    {data.heroImage ? (
                        <Image src={data.heroImage} alt="Hero Background" fill className="object-cover opacity-50 scale-105" />
                    ) : (
                        <div className="absolute inset-0 opacity-20 z-0"
                            style={{ backgroundImage: "radial-gradient(circle at center, #C5A059 1px, transparent 1px)", backgroundSize: "48px 48px" }}
                        />
                    )}
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-8"
                    >
                        <span className="text-brand-gold font-bold tracking-[0.5em] uppercase text-[10px] mb-4 block">
                            {data.heroLabel || "The Narrative"}
                        </span>
                        <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.8] mb-12">
                            The Visionary <br /> <span className="text-brand-gold">Perspective.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
                            {data.heroSubtitle}
                        </p>
                        <div className="pt-12">
                            <div className="w-px h-24 bg-gradient-to-b from-brand-gold to-transparent mx-auto" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Vision / Philosophy Section */}
            <section className="py-32 container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] block border-l-2 border-brand-gold pl-4">
                                {data.visionLabel || "Our Philosophy"}
                            </span>
                            <Heading className="text-5xl md:text-6xl">{data.visionTitle}</Heading>
                        </div>

                        <div className="space-y-8 text-xl text-brand-charcoal/60 font-light leading-relaxed">
                            <p>{data.visionText1}</p>
                            <p>{data.visionText2}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-brand-charcoal/5">
                            <div>
                                <div className="text-4xl font-bold text-brand-charcoal mb-2">{data.statsCustomers}</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">{data.statsCustomersLabel || "Happy Customers"}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-brand-charcoal mb-2">{data.statsSatisfaction}</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">{data.statsSatisfactionLabel || "Satisfaction Rate"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-square">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-premium"
                        >
                            {data.visionImage ? (
                                <Image
                                    src={data.visionImage}
                                    alt="Vision"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-brand-charcoal/5 flex items-center justify-center" />
                            )}
                            <div className="absolute inset-0 bg-brand-charcoal/10" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values / Standard Section */}
            <section className="py-32 bg-brand-charcoal text-white relative overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-3xl mb-24">
                        <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">Core Standards</span>
                        <Heading className="text-white mb-8">{data.valuesTitle}</Heading>
                        <p className="text-white/40 text-xl font-light leading-relaxed">{data.valuesSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.values.map((value, index) => {
                            const IconComponent = iconMap[value.icon] || ShieldCheck;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-gold/20 transition-all duration-500 group"
                                >
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:border-brand-gold transition-colors">
                                        <IconComponent className="w-5 h-5 text-brand-gold" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-4">{value.title}</h3>
                                    <p className="text-sm text-white/40 font-light leading-relaxed">{value.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact / Studio Section */}
            <section className="py-32">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                        <div className="space-y-16">
                            <div className="space-y-6">
                                <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] block">Contact</span>
                                <Heading>{data.contactTitle || "The Experience Center"}</Heading>
                                <p className="text-brand-charcoal/40 text-xl font-light leading-relaxed">
                                    {data.contactSubtitle}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-full border border-brand-charcoal/10 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-brand-gold" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30 mb-2">Location</h4>
                                        <p className="text-brand-charcoal font-medium leading-relaxed whitespace-pre-line">
                                            {contact?.address}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-full border border-brand-charcoal/10 flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-brand-gold" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30 mb-2">Portfolio Inquiry</h4>
                                        <p className="text-brand-charcoal font-medium">{contact?.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-full border border-brand-charcoal/10 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-brand-gold" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30 mb-2">Hours</h4>
                                        <p className="text-brand-charcoal font-medium whitespace-pre-line">{contact?.storeHours}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-full border border-brand-charcoal/10 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-brand-gold" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30 mb-2">Digital Concierge</h4>
                                        <p className="text-brand-charcoal font-medium">{contact?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[600px] w-full rounded-[3rem] overflow-hidden shadow-premium grayscale hover:grayscale-0 transition-all duration-700 border border-brand-charcoal/5">
                            <iframe
                                src={contact?.mapEmbed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115133.01016839848!2d85.07300225139396!3d25.608020764124317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f29937c52d4f05%3A0x831218527871363d!2sPatna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1717758362706!5m2!1sen!2sin"}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
