"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    LogOut,
    LayoutDashboard,
    Image,
    Users,
    Settings,
    ShoppingBag,
    Tag,
    Menu,
    Phone,
    Megaphone,
    Bot,
    Palette
} from "lucide-react";
import Link from "next/link";

const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/content/products", icon: ShoppingBag },
    { name: "Offers", href: "/admin/content/offers", icon: Megaphone },
    { name: "Categories", href: "/admin/content/categories", icon: Tag },
    { name: "Gallery", href: "/admin/content/gallery", icon: Image },
    { name: "Hero Section", href: "/admin/content/hero", icon: LayoutDashboard },
    { name: "Staff Management", href: "/admin/staff", icon: Users },
    { name: "Station Info", href: "/admin/content/contact", icon: Phone },
    { name: "Club Tiers", href: "/admin/content/club", icon: Users },
    { name: "AI Assistant", href: "/admin/api-keys", icon: Bot },
    { name: "Branding", href: "/admin/content/branding", icon: Settings },
    { name: "Appearance", href: "/admin/appearance", icon: Palette },
];

export default function AdminDashboard() {
    const { user, loading: authLoading, logout, role } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/admin/login");
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-brand-sand flex">
                {/* Skeleton Sidebar */}
                <aside className="hidden lg:block w-72 bg-brand-green">
                    <div className="p-8 border-b border-white/5">
                        <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-white/5 rounded mt-2 animate-pulse" />
                    </div>
                    <div className="p-4 space-y-2">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                        ))}
                    </div>
                </aside>
                {/* Skeleton Main */}
                <main className="flex-1 p-8">
                    <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white p-6 border border-gray-100 h-32 animate-pulse">
                                <div className="h-10 w-10 bg-gray-100 rounded mb-4" />
                                <div className="h-5 w-24 bg-gray-100 rounded" />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Role is now derived from AuthContext
    const dashboardTitle = `${role} Dashboard`;

    return (
        <div className="min-h-screen bg-brand-sand flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-brand-dark/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-brand-green transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full border-r border-white/5">
                    {/* Logo */}
                    <div className="p-8 border-b border-white/5">
                        <h1 className="text-2xl font-serif text-white tracking-tight">
                            Smart<span className="italic text-brand-gold">Avenue</span>
                        </h1>
                        <p className="text-brand-gold/60 text-xs uppercase tracking-widest mt-2">{role} Portal</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.filter(item => {
                            if (role !== "Admin" && (item.name === "Staff Management" || item.name === "Branding")) {
                                return false;
                            }
                            return true;
                        }).map((item) => {
                            const Icon = item.icon;
                            const isActive = item.href === "/admin"; // Simple check for dashboard home
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-none transition-all duration-300 group
                                        ${isActive
                                            ? "bg-white/5 text-brand-gold border-r-2 border-brand-gold"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }
                                    `}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "text-brand-gold" : "text-gray-500 group-hover:text-white"}`} />
                                    <span className="font-medium tracking-wide text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-green font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                <p className="text-xs text-gray-500 truncate">{role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 rounded transition-colors text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-serif text-gray-800 tracking-tight">{dashboardTitle}</h2>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Welcome Card */}
                            <div className="bg-brand-green rounded-xl p-8 text-white relative overflow-hidden md:col-span-2 shadow-lg">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-serif mb-2">Welcome back, {user.email?.split('@')[0]}</h3>
                                    <p className="text-brand-gold/80 mb-6 max-w-md">
                                        Manage your store&apos;s products, offers, and content from this unified dashboard.
                                    </p>
                                    <div className="flex gap-3">
                                        <Link href="/admin/content/products" className="px-4 py-2 bg-white text-brand-green rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                                            Manage Products
                                        </Link>
                                        <Link href="/" target="_blank" className="px-4 py-2 bg-brand-gold/20 text-brand-gold rounded-lg font-medium text-sm hover:bg-brand-gold/30 transition-colors">
                                            View Store
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Placeholder */}
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Megaphone className="w-4 h-4 text-brand-gold" />
                                    Active Offers
                                </h4>
                                <p className="text-3xl font-serif text-brand-green">3</p>
                                <p className="text-xs text-gray-500 mt-1">Live on store</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
