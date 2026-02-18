
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, MapPin, Mail } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function Footer() {
    const { config } = useSiteConfig();
    const { branding, contact, footer } = config;

    return (
        <footer className="bg-brand-dark text-white border-t border-white/10 relative overflow-hidden">
            {/* Background Texture - Subtle Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

            <div className="container mx-auto max-w-[1600px] border-l border-r border-white/10 relative z-10">
                {/* Main Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10 border-b border-white/10">

                    {/* Brand / Logo Section (Spans 3) */}
                    <div className="lg:col-span-3 p-6 lg:p-10 flex flex-col items-center md:items-start text-center md:text-left bg-brand-dark/50 backdrop-blur-sm">
                        <Link href="/" className="mb-6 group">
                            <div className="relative w-48 h-12 transition-transform duration-300 group-hover:scale-105">
                                <Image
                                    src={config.branding.logoUrl || "/logo.png"}
                                    alt={config.branding.siteName}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            {config.footer.tagline || config.branding.tagline}
                        </p>
                    </div>

                    {/* Navigation: Shop (Spans 2) */}
                    <div className="lg:col-span-2 p-8 lg:p-10">
                        <h3 className="text-white font-mono uppercase tracking-wider text-sm font-bold mb-6 text-brand-lime">
                            {footer.navigation.shop.title}
                        </h3>
                        <ul className="space-y-3">
                            {footer.navigation.shop.links.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 block text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Navigation: Company (Spans 2) */}
                    <div className="lg:col-span-2 p-6 lg:p-10">
                        <h3 className="text-white font-mono uppercase tracking-wider text-sm font-bold mb-6 text-brand-lime">
                            {footer.navigation.company.title}
                        </h3>
                        <ul className="space-y-3">
                            {footer.navigation.company.links.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 block text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter & Updates (Spans 5) */}
                    <div className="lg:col-span-5 p-6 lg:p-10 bg-white/5">
                        <div className="h-full flex flex-col justify-center">
                            <h3 className="text-2xl font-bold mb-2">{footer.newsletter?.title || "Join the Movement"}</h3>
                            <p className="text-slate-400 mb-6 font-light">{footer.newsletter?.description || "Get the latest collections and exclusive offers sent to your inbox."}</p>

                            <form className="relative max-w-md group" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder={config.labels?.placeholders?.email || "Enter your email address"}
                                    className="w-full bg-brand-dark border border-white/20 text-white px-5 py-4 pr-32 focus:outline-none focus:border-brand-lime transition-colors rounded-none placeholder:text-slate-600"
                                />
                                <button type="submit" className="absolute right-1 top-1 bottom-1 bg-white text-brand-dark px-6 font-bold uppercase text-sm tracking-wide hover:bg-brand-lime transition-colors">
                                    {config.labels?.buttons?.subscribe || "Subscribe"}
                                </button>
                            </form>

                            <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span>{config.labels?.messages?.footerNoSpam || "No spam, unsubscribe anytime."}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Grid: Contact & Social */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 border-b border-white/10">
                    {/* Contact Info */}
                    <div className="p-6 lg:p-8 flex flex-wrap gap-6 md:gap-12 items-center text-sm text-slate-400">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-brand-blue">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <span>{contact.address}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-brand-blue">
                                <Mail className="w-4 h-4" />
                            </div>
                            <span>{contact.email}</span>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="p-6 lg:p-8 flex items-center justify-start md:justify-end gap-3">
                        <span className="text-xs uppercase tracking-widest text-slate-500 mr-4 hidden md:block">Connect</span>
                        {[
                            { Icon: Facebook, url: footer.socialLinks.facebook !== "#" ? footer.socialLinks.facebook : (contact?.facebookUrl || "#") },
                            { Icon: Instagram, url: footer.socialLinks.instagram !== "#" ? footer.socialLinks.instagram : (branding?.instagramUrl || "#") },
                            { Icon: Twitter, url: footer.socialLinks.twitter !== "#" ? footer.socialLinks.twitter : (contact?.twitterUrl || "#") },
                        ].map(({ Icon, url }, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-dark hover:border-white transition-all duration-300 group">
                                <Icon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-6 lg:p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono uppercase tracking-tight">
                    <p>
                        {config.labels?.messages?.copyright ?
                            config.labels.messages.copyright.replace("{year}", new Date().getFullYear().toString()) :
                            `© ${new Date().getFullYear()} ${branding.siteName || "Smart Avenue 99"}. All rights reserved.`}
                    </p>
                    <div className="flex gap-6">
                        {footer.bottomLinks.map((link, idx) => (
                            <Link key={idx} href={link.href === "/sitemap" ? "/site-map" : link.href} className="hover:text-brand-lime transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
