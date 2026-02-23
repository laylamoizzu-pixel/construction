"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Camera, Loader2, Mic, Square } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { analyzeImage } from "@/app/actions/image-search-action";

const DEFAULT_NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Offers", href: "/offers" },
    { label: "Genie Stylist", href: "/stylist" },
    { label: "Genie Gift Finder", href: "/gift-finder" },
    { label: "Departments", href: "/departments" },
    { label: "About Us", href: "/about" },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { config } = useSiteConfig();

    // Use dynamic header links from config, fallback to defaults
    const NAV_LINKS = config?.headerLinks || DEFAULT_NAV_LINKS;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setIsSearchOpen(false);
            setIsMenuOpen(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        const originalQuery = searchQuery;
        setSearchQuery("Analyzing image...");

        try {
            const formData = new FormData();
            formData.append("image", file);

            const result = await analyzeImage(formData);

            if (result.success && result.query) {
                setSearchQuery(result.query);
                // Auto-submit search after analysis
                router.push(`/products?search=${encodeURIComponent(result.query)}`);
                setIsSearchOpen(false);
            }
        } catch (error) {
            console.error("Image search failed:", error);
            setSearchQuery(originalQuery); // Revert on failure
            alert("Failed to analyze image. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Voice Search Logic
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');

                // Show loading state
                const originalQuery = searchQuery;
                setSearchQuery("Listening...");
                setIsAnalyzing(true);

                try {
                    // Dynamic import to avoid server-side issues
                    const { processVoiceSearch } = await import("@/app/actions/voice-search-action");
                    const result = await processVoiceSearch(formData);

                    if (result.success && result.text) {
                        setSearchQuery(result.text);
                        // Auto-submit
                        router.push(`/products?search=${encodeURIComponent(result.text)}`);
                        setIsSearchOpen(false);
                    } else {
                        console.error("Voice search failed:", result.error);
                        setSearchQuery(originalQuery);
                    }
                } catch (err) {
                    console.error("Voice search error:", err);
                    setSearchQuery(originalQuery);
                } finally {
                    setIsAnalyzing(false);
                    // Stop all tracks
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleVoiceClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
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
            className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
                ? "top-4 flex justify-center px-4"
                : "top-0 w-full"
                }`}
        >
            <div
                className={`flex items-center justify-between transition-all duration-500 ease-in-out ${isScrolled
                    ? "container max-w-5xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl px-6 py-2"
                    : "w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 md:px-8 py-4"
                    }`}
                style={{
                    color: config.theme.navbarTextColor || config.theme.textColor || "#0f172a",
                }}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group relative z-50">
                    <div className={`relative transition-all duration-500 ${isScrolled ? 'w-12 h-12' : 'w-20 h-20'} group-hover:scale-110 flex items-center justify-center`}>
                        {/* Premium Glow/Ring Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-lime-400/20 rounded-full blur-md group-hover:from-cyan-400/40 group-hover:to-lime-400/40 transition-all duration-500" />
                        <div className="absolute inset-0 border border-white/20 dark:border-white/10 rounded-full shadow-lg shadow-black/5" />

                        <div className="relative w-full h-full p-1">
                            <Image
                                src={config.branding.logoUrl || "/logo.png"}
                                alt={config.branding.siteName || "Smart Avenue"}
                                fill
                                className="object-contain drop-shadow-xl"
                                priority
                            />
                        </div>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive ? "text-white" : "hover:text-cyan-500 dark:hover:text-cyan-400"
                                    }`}
                                style={{ color: isActive ? "#ffffff" : (config.theme.navbarTextColor || config.theme.textColor) }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full shadow-lg shadow-cyan-500/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="hidden lg:flex items-center gap-3">
                    {/* Search Bar */}
                    <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? "w-72" : "w-10"}`}>
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.form
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "100%" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    onSubmit={handleSearch}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-full pr-10"
                                >
                                    <div className="relative">
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            disabled={isAnalyzing}
                                            placeholder={isAnalyzing ? "Analyzing..." : "Search collections..."}
                                            className="w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm rounded-full pl-4 pr-20 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                                            onBlur={() => !searchQuery && !isAnalyzing && setIsSearchOpen(false)}
                                        />

                                        {/* Visual & Voice Search Buttons */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isAnalyzing}
                                                className="text-slate-400 hover:text-brand-blue transition-colors disabled:opacity-50 p-1"
                                                title="Search with image"
                                            >
                                                {isAnalyzing ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Camera className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleVoiceClick}
                                                disabled={isAnalyzing}
                                                className={`transition-colors disabled:opacity-50 p-1 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-brand-blue'}`}
                                                title="Voice Search"
                                            >
                                                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
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
                <div className="flex lg:hidden items-center gap-2">
                    <button
                        onClick={() => {
                            setIsSearchOpen(!isSearchOpen);
                            setIsMenuOpen(false);
                        }}
                        className={`p-2 rounded-full transition-all duration-300 ${isScrolled ? 'bg-cyan-500/10 text-cyan-500' : ''}`}
                        style={{ color: isScrolled ? undefined : (config.theme.navbarTextColor || config.theme.textColor) }}
                        aria-label={isSearchOpen ? "Close search" : "Open search"}
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen);
                            setIsSearchOpen(false);
                        }}
                        className={`p-2 rounded-full transition-all duration-300 ${isScrolled ? 'bg-cyan-500/10 text-cyan-500' : ''}`}
                        style={{ color: isScrolled ? undefined : (config.theme.navbarTextColor || config.theme.textColor) }}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 bg-white dark:bg-slate-900 z-50 flex items-center px-4 lg:hidden"
                    >
                        <form onSubmit={handleSearch} className="w-full relative flex items-center gap-2">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3" />
                            <input
                                type="text"
                                placeholder={isAnalyzing ? "Analyzing..." : (config.labels?.placeholders?.search || config.branding.searchPlaceholder || "Search...")}
                                autoFocus
                                disabled={isAnalyzing}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-12 py-2.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-brand-blue/20"
                            />
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(false)}
                                className="p-2 text-slate-500 hover:text-slate-700"
                            >
                                <span className="text-xs font-semibold">Cancel</span>
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl shadow-2xl z-[60] lg:hidden flex flex-col border-l border-white/20"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-lime-400/20 rounded-full blur-lg" />
                                        <Image
                                            src={config.branding.logoUrl || "/logo.png"}
                                            alt={config.branding.siteName || "Smart Avenue"}
                                            fill
                                            className="object-contain drop-shadow-2xl"
                                        />
                                    </div>
                                </Link>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-8 px-8 space-y-2">
                                {NAV_LINKS.map((link, idx) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`group flex items-center justify-between py-4 text-xl font-bold transition-all ${isActive
                                                    ? "text-cyan-500 translate-x-1"
                                                    : "text-slate-800 dark:text-slate-100 hover:text-cyan-400 hover:translate-x-1"
                                                    }`}
                                            >
                                                <span>{link.label}</span>
                                                <div className={`h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-lime-400 transition-all duration-500 ${isActive ? 'opacity-100 scale-100 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'opacity-0 scale-0'}`} />
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>


                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
