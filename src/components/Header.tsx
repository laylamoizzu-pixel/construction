"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { NAV_LINKS } from "@/lib/data";
import { useBranding } from "@/context/branding-context";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { branding } = useBranding();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass-header py-3 shadow-md" : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo - Now Dynamic */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-40 h-12">
                        <Image
                            src={branding.logoUrl || "/logo.png"}
                            alt={branding.siteName || "Smart Avenue"}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-brand-gold relative group ${pathname === link.href
                                ? "text-brand-gold"
                                : isScrolled
                                    ? "text-gray-700"
                                    : "text-gray-100"
                                }`}
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                {/* Icons & Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <button className={`p-2 rounded-full transition-colors ${isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                        <Search className="w-5 h-5" />
                    </button>

                    <Link
                        href="/products"
                        className="flex items-center gap-2 bg-brand-gold hover:bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-yellow-500/20"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span className="hidden lg:inline">Shop Now</span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-700"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <X className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
                    ) : (
                        <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 md:hidden p-4 flex flex-col gap-4"
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-lg font-medium p-2 rounded-lg hover:bg-gray-50 ${pathname === link.href ? "text-brand-gold bg-yellow-50" : "text-gray-700"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex gap-4 mt-2 pt-4 border-t border-gray-100">
                            <Link
                                href="/products"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-brand-green text-white"
                            >
                                <ShoppingBag className="w-5 h-5" /> Shop
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
