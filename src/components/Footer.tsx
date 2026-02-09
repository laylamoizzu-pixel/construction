
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

import { useSiteConfig } from "@/context/SiteConfigContext";

export default function Footer() {
    const { config } = useSiteConfig();
    const { branding, contact } = config;

    return (
        <footer className="bg-brand-dark text-white pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-40 h-12">
                                <Image
                                    src="/logo.png"
                                    alt="Smart Avenue"
                                    fill
                                    className="object-contain brightness-0 invert"
                                />
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            {branding.tagline || "Patna's premier shopping destination where luxury meets convenience. Experience world-class retail therapy."}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-brand-gold hover:text-brand-dark transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            {contact.instagramUrl && (
                                <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-brand-gold hover:text-brand-dark transition-colors">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {/* WhatsApp is not in the type definition I created earlier, I might need to add it or remove it. 
                                I'll add it to the type definition later. For now, I'll remove it or comment it out if it doesn't exist.
                                Actually, I'll just change it to contact.instagramUrl and contact.twitterUrl.
                                Let's check what I defined in src/types/site-config.ts.
                                facebookUrl?: string;
                                instagramUrl?: string;
                                twitterUrl?: string;
                                No whatsappUrl.
                            */}
                            <a href={contact.twitterUrl || "#"} className="p-2 bg-white/5 rounded-full hover:bg-brand-gold hover:text-brand-dark transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-brand-gold font-serif font-semibold mb-4 text-lg">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/departments" className="hover:text-white transition-colors">Departments</Link></li>
                            <li><Link href="/club" className="hover:text-white transition-colors">The Smart Club</Link></li>
                            <li><Link href="/offers" className="hover:text-white transition-colors">Weekly Offers</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="text-brand-gold font-serif font-semibold mb-4 text-lg">Customer Care</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                            <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-brand-gold font-serif font-semibold mb-4 text-lg">Visit Us</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                                <span className="whitespace-pre-line">{contact.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                                <span>{contact.phone}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                                <span>{contact.email}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Smart Avenue Retail Pvt. Ltd. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
