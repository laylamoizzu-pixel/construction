"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Globe, ShieldCheck, Users, Zap, TrendingUp, MapPin, Phone, Mail, Clock } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Tech Hero */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-brand-dark">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-lime/20 mix-blend-overlay" />
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-brand-lime font-bold tracking-[0.2em] uppercase text-sm mb-4 block animate-pulse">Our Story</span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lime to-brand-blue">Avenue</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
                            Building the future of retail, delivered to your doorstep.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-24 container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <div>
                            <span className="text-brand-blue font-bold tracking-widest uppercase text-xs mb-2 block">Our Vision</span>
                            <h2 className="text-4xl font-bold text-brand-dark mb-6 tracking-tight">Redefining Retail in Patna</h2>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            We are not just a store; we are a logistics ecosystem designed for modern living. Smart Avenue bridges the gap between premium global brands and optimal local convenience.
                        </p>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Our platform leverages cutting-edge technology to ensure that quality, affordability, and speed are not mutually exclusive, but the standard for every interaction.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-6">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Users className="w-6 h-6 text-brand-blue mb-2" />
                                <div className="text-2xl font-bold text-brand-dark">10k+</div>
                                <div className="text-sm text-slate-500">Happy Customers</div>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <TrendingUp className="w-6 h-6 text-brand-lime mb-2" />
                                <div className="text-2xl font-bold text-brand-dark">98%</div>
                                <div className="text-sm text-slate-500">Satisfaction Rate</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative aspect-square w-full max-w-md mx-auto">
                        <div className="absolute inset-0 bg-brand-blue rounded-full opacity-20 blur-3xl transform -translate-x-12 translate-y-12" />
                        <div className="absolute inset-0 bg-brand-lime rounded-full opacity-20 blur-3xl transform translate-x-12 -translate-y-12" />

                        <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/50">
                            <Image
                                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" // Modern office/tech vibe
                                alt="Modern Office"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-brand-lime font-bold tracking-widest uppercase text-sm mb-2 block">Core Principles</span>
                        <h2 className="text-4xl font-bold text-brand-dark mb-4 tracking-tight">The Smart Standard</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Driven by innovation, grounded in integrity.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Verified Quality",
                                desc: "Rigorous quality checks on 100% of inventory.",
                                color: "text-brand-blue"
                            },
                            {
                                icon: Globe,
                                title: "Global Access",
                                desc: "Sourcing the best products from around the world.",
                                color: "text-brand-lime"
                            },
                            {
                                icon: Zap,
                                title: "Rapid Delivery",
                                desc: "Same-day processing and optimized logistics.",
                                color: "text-orange-500"
                            },
                            {
                                icon: CheckCircle2,
                                title: "Total Transparency",
                                desc: "Clear pricing, no hidden fees, honest service.",
                                color: "text-brand-dark"
                            },
                        ].map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-brand-lime/50 hover:bg-white hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${value.color}`}>
                                    <value.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-3 group-hover:text-brand-blue transition-colors">{value.title}</h3>
                                <p className="text-slate-500 leading-relaxed group-hover:text-slate-600">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section (Merged) */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <span className="text-brand-blue font-bold tracking-widest uppercase text-sm mb-2 block">Get in Touch</span>
                        <h2 className="text-4xl font-bold text-brand-dark mb-4 tracking-tight">Visit Our Store</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">We'd love to see you in person. Here's where you can find us.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-brand-dark mb-6">Store Information</h3>

                            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-full">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-brand-dark">Address</h4>
                                    <p className="text-slate-600 leading-relaxed">
                                        Smart Avenue Retail Complex,<br />
                                        Level 3, P&M Mall, Patliputra Colony,<br />
                                        Patna, Bihar 800013
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-full">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-brand-dark">Phone</h4>
                                    <p className="text-slate-600">+91 612 2xxx xxx (Store)</p>
                                    <p className="text-slate-600">+91 98xxx xxxxx (Support)</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-full">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-brand-dark">Opening Hours</h4>
                                    <p className="text-slate-600">Monday - Sunday</p>
                                    <p className="font-semibold text-brand-lime">10:00 AM - 10:00 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-full">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-brand-dark">Email</h4>
                                    <p className="text-slate-600">support@smartavenue.com</p>
                                    <p className="text-slate-600">careers@smartavenue.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Embed */}
                        <div className="h-full min-h-[400px] w-full bg-slate-200 rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115133.01016839848!2d85.07300225139396!3d25.608020764124317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f29937c52d4f05%3A0x831218527871363d!2sPatna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1717758362706!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
}
