"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

const DEFAULT_NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/products" },
    { label: "Construction", href: "/construction" },
    { label: "Deals", href: "/offers" },
    { label: "About", href: "/about" },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { config } = useSiteConfig();

    const NAV_LINKS = config?.headerLinks || DEFAULT_NAV_LINKS;



    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed left-0 right-0 z-50 top-0 flex justify-center px-4 transition-all duration-500 ease-in-out",
                isScrolled ? "pt-2" : "pt-6"
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between transition-all duration-500 ease-in-out container max-w-6xl rounded-full border border-white/20 shadow-premium px-8 py-3",
                    isScrolled
                        ? "bg-white/80 dark:bg-brand-charcoal/80 backdrop-blur-xl scale-[0.98]"
                        : "bg-white/40 dark:bg-brand-charcoal/40 backdrop-blur-md"
                )}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group relative z-50">
                    <div className="relative w-10 h-10 transition-transform duration-500 group-hover:scale-110">
                        <Image
                            src={config.branding.logoUrl || "/logo.png"}
                            alt={config.branding.siteName || "Gharana"}
                            fill
                            className="object-contain filter dark:invert"
                            priority
                        />
                    </div>
                    <span className="font-bold tracking-tighter text-xl hidden sm:block text-brand-charcoal">
                        {config.branding.siteName || "Gharana"}<span className="text-brand-gold">.</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-2">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300",
                                    isActive ? "text-brand-charcoal" : "text-brand-charcoal/50 hover:text-brand-charcoal"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute bottom-0 left-5 right-5 h-[2px] bg-brand-gold"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSearch}
                        className="p-2 hover:bg-brand-charcoal/5 rounded-full transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-4 h-4 text-brand-charcoal" />
                    </button>

                    <Link href="/contact" className="hidden sm:block">
                        <Button variant="primary" size="sm" className="text-[10px] uppercase tracking-[0.2em]">
                            Book Consultation
                        </Button>
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 hover:bg-brand-charcoal/5 rounded-full transition-colors"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-[55] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-brand-white z-[60] lg:hidden flex flex-col p-12"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <span className="font-bold tracking-tighter text-2xl">
                                    {config.branding.siteName || "Gharana"}<span className="text-brand-gold">.</span>
                                </span>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-8">
                                {NAV_LINKS.map((link, idx) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="text-4xl font-bold tracking-tight text-brand-charcoal hover:text-brand-gold transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className="mt-auto space-y-6">
                                <p className="text-brand-charcoal/40 text-sm font-medium uppercase tracking-widest">
                                    Get in Touch
                                </p>
                                <Button className="w-full" size="lg">Book Consultation</Button>
                                <div className="flex gap-4 pt-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-charcoal font-bold">In</div>
                                    <div className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-charcoal font-bold">Ig</div>
                                    <div className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center text-brand-charcoal font-bold">Fb</div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
