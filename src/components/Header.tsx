"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

{ label: "Home", href: "/" },
{ label: "Products", href: "/products" },
{ label: "Offers", href: "/offers" },
{ label: "Departments", href: "/departments" },
{ label: "About Us", href: "/about" },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { config } = useSiteConfig();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setIsSearchOpen(false);
            setIsMobileMenuOpen(false);
        }
    };

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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
                ? "bg-white/90 backdrop-blur-xl border-gray-200/50 py-3 shadow-sm"
                : "bg-transparent border-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group relative z-50">
                    <div className="relative w-40 h-10 transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src={config.branding.logoUrl || "/logo.png"}
                            alt={config.branding.siteName || "Smart Avenue"}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm px-2 py-1.5 rounded-full border border-white/10 shadow-sm">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive
                                    ? "text-white"
                                    : isScrolled ? "text-slate-600 hover:text-brand-blue" : "text-white/90 hover:text-white"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-gradient-to-r from-brand-blue to-accent rounded-full shadow-lg shadow-brand-blue/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Search Bar */}
                    <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? "w-64" : "w-10"}`}>
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.form
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "100%" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    onSubmit={handleSearch}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-full pr-10"
                                >
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full bg-slate-100/50 border border-slate-200 text-slate-800 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                                        onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                    />
                                </motion.form>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={toggleSearch}
                            className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isSearchOpen
                                ? "bg-slate-100 text-brand-blue"
                                : isScrolled
                                    ? "hover:bg-slate-100 text-slate-700"
                                    : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                                }`}
                        >
                            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </button>
                    </div>

                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? "text-slate-800" : "text-white"
                        }`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl p-4 flex flex-col gap-2 md:hidden"
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === link.href
                                    ? "bg-brand-blue/10 text-brand-blue"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="h-px bg-slate-100 my-2" />
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                            />
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
