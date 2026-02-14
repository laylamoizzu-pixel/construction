import Link from "next/link";
import { ChevronRight, MapPin, Phone, Mail } from "lucide-react";
import { getSiteConfig } from "@/app/actions/site-config";

export default async function SitemapPage() {
    const config = await getSiteConfig();
    const { contact } = config;

    const sitemapGroups = [
        {
            title: "Main Sections",
            links: [
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about" },
                { name: "Departments", href: "/departments" },
                { name: "All Products", href: "/products" },
                { name: "Weekly Offers", href: "/offers" },
            ]
        },
        {
            title: "Legal & Info",
            links: [
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Sitemap", href: "/site-map" },
            ]
        }
    ];

    return (
        <main className="min-h-screen pt-32 pb-20 bg-slate-50">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                <nav className="flex mb-8 text-sm font-medium text-slate-500">
                    <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
                    <span className="mx-2 text-slate-300">/</span>
                    <span className="text-slate-900">Sitemap</span>
                </nav>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Site <span className="text-brand-blue">Map</span>
                        </h1>
                        Easy navigation to all parts of our store. Find exactly what you&apos;re looking for.

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {sitemapGroups.map((group, idx) => (
                                <div key={idx} className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
                                        <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
                                        {group.title}
                                    </h2>
                                    <ul className="space-y-4">
                                        {group.links.map((link, lIdx) => (
                                            <li key={lIdx}>
                                                <Link
                                                    href={link.href}
                                                    className="group flex items-center gap-2 text-slate-600 hover:text-brand-blue transition-all duration-300"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition-colors" />
                                                    <span className="font-medium">{link.name}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-20 pt-12 border-t border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-8">Quick Contact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex items-center gap-4 text-slate-600">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-blue">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm">{contact.address}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-blue">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm">{contact.phone}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-blue">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm">{contact.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
