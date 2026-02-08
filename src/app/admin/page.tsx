"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    Loader2,
    LogOut,
    LayoutDashboard,
    Image,
    Tag,
    Phone,
    Users,
    Home,
    Menu,
    X,
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-700">
                        <h1 className="text-xl font-bold text-white">
                            Smart<span className="text-amber-400">Avenue</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {user.email}
                                </p>
                                <p className="text-slate-400 text-xs">Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
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
                <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:block">
                            Welcome back!
                        </span>
                    </div>
                </header>

                {/* Dashboard content */}
                <div className="flex-1 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick actions */}
                        {navItems.slice(1).map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Click to manage</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Stats section */}
                    <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold text-amber-600">-</p>
                                <p className="text-sm text-gray-500">Active Offers</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold text-amber-600">-</p>
                                <p className="text-sm text-gray-500">Gallery Images</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold text-amber-600">-</p>
                                <p className="text-sm text-gray-500">Staff Members</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold text-amber-600">-</p>
                                <p className="text-sm text-gray-500">Departments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
