"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Building2, User } from "lucide-react";
import { Heading } from "./ui/Typography";
import { Button } from "./ui/Button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ContactContentProps {
    contact: {
        address: string;
        phone: string;
        email: string;
        mapEmbed: string;
        storeHours: string;
    } | null;
}

export default function ContactContent({ contact }: ContactContentProps) {
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");
        // Simulate API call
        setTimeout(() => setFormStatus("success"), 1500);
    };

    return (
        <div className="bg-brand-white min-h-screen">
            {/* Minimalist Hero */}
            <section className="relative pt-48 pb-24 bg-brand-charcoal overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle at center, #C5A059 1px, transparent 1px)", backgroundSize: "48px 48px" }}
                />
                <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                    >
                        <span className="text-brand-gold font-bold tracking-[0.5em] uppercase text-[10px] block">Connect</span>
                        <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-tight">
                            Your Vision, <br /> Our <span className="text-brand-gold">Foundation.</span>
                        </h1>
                        Whether you&apos;re seeking your dream home or a strategic construction partner, our concierge is here to guide you.
                    </motion.div>
                </div>
            </section>

            {/* Main Contact Section */}
            <section className="py-32">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">

                        {/* Information Sidebar */}
                        <div className="lg:col-span-5 space-y-16">
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">The Studio</h3>
                                    <Heading className="text-4xl">Experience Excellence.</Heading>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-6 group">
                                        <div className="w-14 h-14 rounded-full border border-brand-charcoal/10 flex items-center justify-center shrink-0 group-hover:border-brand-gold transition-colors duration-500">
                                            <MapPin className="w-5 h-5 text-brand-gold" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">Address</h4>
                                            <p className="text-lg text-brand-charcoal leading-relaxed font-light">{contact?.address || "Gharana Experience Center, India"}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 group">
                                        <div className="w-14 h-14 rounded-full border border-brand-charcoal/10 flex items-center justify-center shrink-0 group-hover:border-brand-gold transition-colors duration-500">
                                            <Phone className="w-5 h-5 text-brand-gold" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">Direct Line</h4>
                                            <p className="text-lg text-brand-charcoal leading-relaxed font-light">{contact?.phone || "+91 12345 67890"}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 group">
                                        <div className="w-14 h-14 rounded-full border border-brand-charcoal/10 flex items-center justify-center shrink-0 group-hover:border-brand-gold transition-colors duration-500">
                                            <Mail className="w-5 h-5 text-brand-gold" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">concierge</h4>
                                            <p className="text-lg text-brand-charcoal leading-relaxed font-light">{contact?.email || "concierge@gharanarealtors.com"}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 group">
                                        <div className="w-14 h-14 rounded-full border border-brand-charcoal/10 flex items-center justify-center shrink-0 group-hover:border-brand-gold transition-colors duration-500">
                                            <Clock className="w-5 h-5 text-brand-gold" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">Office Hours</h4>
                                            <p className="text-lg text-brand-charcoal leading-relaxed font-light whitespace-pre-line">{contact?.storeHours || "Mon - Sat: 9:00 AM - 7:00 PM"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 rounded-[2.5rem] bg-brand-charcoal text-white space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 blur-[60px]" />
                                <h3 className="text-2xl font-bold tracking-tight">Schedule a Site Visit</h3>
                                <p className="text-white/40 font-light leading-relaxed">
                                    Witness our architectural precision firsthand. Book a guided tour of our ongoing premium projects.
                                </p>
                                <Button className="w-full bg-brand-gold hover:bg-white hover:text-brand-charcoal text-white border-none h-14 text-[10px] uppercase tracking-widest">
                                    Book Consultation
                                </Button>
                            </div>
                        </div>

                        {/* Inquiry Form */}
                        <div className="lg:col-span-7">
                            <div className="p-8 md:p-16 rounded-[3rem] bg-white border border-brand-charcoal/5 shadow-premium">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/40" />
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full bg-transparent border-0 border-b border-brand-charcoal/10 pl-8 pb-4 focus:ring-0 focus:border-brand-gold transition-colors placeholder:text-brand-charcoal/10 text-lg font-light"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/40" />
                                                <input
                                                    required
                                                    type="email"
                                                    className="w-full bg-transparent border-0 border-b border-brand-charcoal/10 pl-8 pb-4 focus:ring-0 focus:border-brand-gold transition-colors placeholder:text-brand-charcoal/10 text-lg font-light"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/40" />
                                                <input
                                                    required
                                                    type="tel"
                                                    className="w-full bg-transparent border-0 border-b border-brand-charcoal/10 pl-8 pb-4 focus:ring-0 focus:border-brand-gold transition-colors placeholder:text-brand-charcoal/10 text-lg font-light"
                                                    placeholder="+91 00000 00000"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">Inquiry Type</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/40" />
                                                <select className="w-full bg-transparent border-0 border-b border-brand-charcoal/10 pl-8 pb-4 focus:ring-0 focus:border-brand-gold transition-colors appearance-none text-lg font-light">
                                                    <option>Residential Property</option>
                                                    <option>Commercial Space</option>
                                                    <option>Inaugural Plots</option>
                                                    <option>Construction Services</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/30">Your Message</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-0 top-4 w-4 h-4 text-brand-gold/40" />
                                            <textarea
                                                required
                                                rows={4}
                                                className="w-full bg-transparent border-0 border-b border-brand-charcoal/10 pl-8 pb-4 focus:ring-0 focus:border-brand-gold transition-colors placeholder:text-brand-charcoal/10 text-lg font-light resize-none"
                                                placeholder="Tell us about your requirements..."
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button
                                            disabled={formStatus === "submitting" || formStatus === "success"}
                                            className={cn(
                                                "w-full h-16 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500",
                                                formStatus === "success" ? "bg-green-500 text-white" : "bg-brand-charcoal text-white hover:bg-brand-gold"
                                            )}
                                        >
                                            {formStatus === "idle" && <span className="flex items-center gap-3">Send Inquiry <Send className="w-3 h-3" /></span>}
                                            {formStatus === "submitting" && "Transmitting..."}
                                            {formStatus === "success" && "Message Received. We will contact you."}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="h-[600px] w-full relative grayscale hover:grayscale-0 transition-all duration-1000 overflow-hidden">
                <iframe
                    src={contact?.mapEmbed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115133.01016839848!2d85.07300225139396!3d25.608020764124317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f29937c52d4f05%3A0x831218527871363d!2sPatna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1717758362706!5m2!1sen!2sin"}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0"
                />
            </section>
        </div>
    );
}
