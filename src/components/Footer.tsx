"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Mail, Linkedin } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function Footer() {
    const { config } = useSiteConfig();
    if (!config) return null;
    const { branding, contact, footer } = config;

    return (
        <footer className="bg-brand-charcoal text-white border-t border-white/5 relative overflow-hidden">
            {/* Ambient subtle glow for depth */}
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-brand-gold/5 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 py-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 md:gap-24 mb-24">

                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href="/" className="block group">
                            <span className="text-3xl font-bold tracking-tighter">
                                Gharana<span className="text-brand-gold">.</span>
                            </span>
                        </Link>
                        <p className="text-white/40 text-lg leading-relaxed max-w-sm font-light">
                            {footer.tagline || branding.tagline || "Redefining the standard of premium construction and real estate in the modern age."}
                        </p>
                        <div className="flex gap-4">
                            {[
                                { Icon: Instagram, url: branding.instagramUrl || "#" },
                                { Icon: Facebook, url: contact.facebookUrl || "#" },
                                { Icon: Twitter, url: contact.twitterUrl || "#" },
                                { Icon: Linkedin, url: "#" }
                            ].map(({ Icon, url }, i) => (
                                <Link
                                    key={i}
                                    href={url}
                                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all duration-500 text-white/60 hover:text-white"
                                >
                                    <Icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">
                                {footer.navigation.shop.title || "Portfolio"}
                            </h3>
                            <ul className="space-y-4">
                                {footer.navigation.shop.links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link href={link.href} className="text-white/40 hover:text-white transition-colors duration-300 text-sm font-medium">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">
                                {footer.navigation.company.title || "Company"}
                            </h3>
                            <ul className="space-y-4">
                                {footer.navigation.company.links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link href={link.href} className="text-white/40 hover:text-white transition-colors duration-300 text-sm font-medium">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <h3 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">
                            Contact
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-1" />
                                <span className="text-white/40 group-hover:text-white transition-colors text-sm leading-relaxed font-light">
                                    {contact.address}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                                <span className="text-white/40 group-hover:text-white transition-colors text-sm font-light">
                                    {contact.email}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="p-1 rounded-full bg-white/5 border border-white/10 flex">
                                <input
                                    type="email"
                                    placeholder="Join our newsletter"
                                    className="bg-transparent border-none px-6 py-3 text-sm focus:ring-0 w-full placeholder:text-white/20"
                                />
                                <button className="bg-brand-gold text-white px-6 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/20">
                        {`© ${new Date().getFullYear()} ${branding.siteName}. Designed for Excellence.`}
                    </p>
                    <div className="flex gap-8">
                        {footer.bottomLinks.map((link, idx) => (
                            <Link key={idx} href={link.href} className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/20 hover:text-brand-gold transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
