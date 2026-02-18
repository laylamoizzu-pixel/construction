"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

const DEFAULT_NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Offers", href: "/offers" },
    { label: "Stylist", href: "/stylist" },
    { label: "Gift Finder", href: "/gift-finder" },
    { label: "Departments", href: "/departments" },
    { label: "About Us", href: "/about" },
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

    // Use dynamic header links from config, fallback to defaults
    const NAV_LINKS = (config as typeof config & { headerLinks?: { label: string; href: string }[] })?.headerLinks || DEFAULT_NAV_LINKS;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setIsSearchOpen(false);
            setIsMenuOpen(false);
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${config.theme.navbarOpaque ? 'shadow-md' : 'shadow-sm'}`}
            style={{
                backgroundColor: config.theme.navbarOpaque
                    ? (config.theme.navbarColor || config.theme.backgroundColor || "#ffffff")
                    : (isScrolled ? (config.theme.navbarColor || config.theme.backgroundColor || "#ffffff") : "transparent"),
                color: config.theme.navbarTextColor || config.theme.textColor || "#0f172a",
                borderColor: isScrolled || config.theme.navbarOpaque ? "rgba(229, 231, 235, 0.5)" : "transparent",
                backdropFilter: config.theme.navbarOpaque ? "none" : (isScrolled ? "blur(8px)" : "none")
            }}
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
                                className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 opacity-90 hover:opacity-100`}
                                style={{ color: isActive ? undefined : (config.theme.navbarTextColor || config.theme.textColor) }}
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
                                        placeholder={config.labels?.placeholders?.search || config.branding.searchPlaceholder || "Search collection..."}
                                        className="w-full bg-slate-100/50 border border-slate-200 text-slate-800 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                                        onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                    />
                                </motion.form>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={toggleSearch}
                            aria-label={isSearchOpen ? "Close search" : "Open search"}
                            className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isSearchOpen
                                ? "bg-slate-100 text-brand-blue"
                                : "hover:bg-slate-100"
                                }`}
                            style={{
                                color: isSearchOpen ? undefined : (config.theme.navbarTextColor || config.theme.textColor)
                            }}
                        >
                            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </button>
                    </div>

                </div>

                {/* Header Actions (Mobile) */}
                <div className="flex items-center gap-2 md:hidden">
                    <button
                        onClick={() => {
                            setIsSearchOpen(!isSearchOpen);
                            setIsMenuOpen(false); // Close menu if search is opened
                        }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: config.theme.navbarTextColor || config.theme.textColor }}
                        aria-label={isSearchOpen ? "Close search" : "Open search"}
                    >
                        <Search className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen);
                            setIsSearchOpen(false); // Close search if menu is opened
                        }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: config.theme.navbarTextColor || config.theme.textColor }}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
                    >
                        <form onSubmit={handleSearch} className="container mx-auto px-4 py-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={config.labels?.placeholders?.search || config.branding.searchPlaceholder || "Search collections..."}
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                />
                                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue font-semibold">
                                    Search
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-2xl z-[60] md:hidden flex flex-col pt-24"
                    >
                        <div className="px-6 space-y-2">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block py-4 text-xl font-medium border-b border-slate-200 ${pathname === link.href ? "text-brand-blue" : "text-slate-800"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
