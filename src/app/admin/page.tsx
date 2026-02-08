"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    LogOut,
    LayoutDashboard,
    Image,
    Tag,
    Phone,
    Users,
    Home,
    Menu,

    Package,
    Folder,
    Palette
} from "lucide-react";
import Link from "next/link";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Branding", href: "/admin/content/branding", icon: Palette },
    { name: "Hero Section", href: "/admin/content/hero", icon: Home },
    { name: "Products", href: "/admin/content/products", icon: Package },
    { name: "Categories", href: "/admin/content/categories", icon: Folder },
    { name: "Offers", href: "/admin/content/offers", icon: Tag },
    { name: "Gallery", href: "/admin/content/gallery", icon: Image },
    { name: "Contact Info", href: "/admin/content/contact", icon: Phone },
    { name: "Staff Management", href: "/admin/staff", icon: Users },
];



export default function AdminDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
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

    const getRole = (email: string | null | undefined) => {
        if (!email) return "Staff";
        if (email === "admin@smartavenue99.com") return "Admin";
        // Future: Check for manager emails or role field in DB
        return "Staff";
    };

    const role = getRole(user?.email);
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

                    {/* User section */}
                    <div className="p-6 border-t border-white/5 bg-brand-dark/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-serif text-lg border border-brand-gold/30">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {user.email}
                                </p>
                                <p className="text-brand-gold/60 text-xs uppercase tracking-wider">{role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded transition-colors text-xs uppercase tracking-widest"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-brand-dark hover:bg-gray-50 rounded"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-serif text-brand-dark">{dashboardTitle}</h2>
                        <p className="text-sm text-gray-500 hidden sm:block mt-1">
                            Welcome back, here&apos;s what&apos;s happening today.
                        </p>
                    </div>
                </header>

                {/* Dashboard content */}
                <div className="flex-1 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick actions */}
                        {navItems.slice(1).filter(item => {
                            if (role !== "Admin" && (item.name === "Staff Management" || item.name === "Branding")) {
                                return false;
                            }
                            return true;
                        }).map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 hover:border-brand-gold/20"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-brand-sand rounded-none group-hover:bg-brand-green/5 transition-colors">
                                            <Icon className="w-6 h-6 text-brand-dark group-hover:text-brand-green" />
                                        </div>
                                        <span className="text-xs text-brand-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Manage</span>
                                    </div>
                                    <h3 className="font-serif text-lg text-brand-dark mb-1 group-hover:text-brand-green transition-colors">{item.name}</h3>
                                    <p className="text-sm text-gray-400 font-light">View and edit items</p>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Stats section */}
                    <div className="mt-10">
                        <h3 className="font-serif text-xl text-brand-dark mb-6">Quick Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Active Offers", value: "-", icon: Tag },
                                { label: "Gallery Images", value: "-", icon: Image },
                                { label: "Staff Members", value: "-", icon: Users },
                                { label: "Departments", value: "-", icon: Folder }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <div className="mb-3 text-brand-gold/50">
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-3xl font-serif text-brand-dark mb-1">{stat.value}</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
