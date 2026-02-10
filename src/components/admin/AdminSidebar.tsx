"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    LayoutDashboard,
    ShoppingBag,
    Megaphone,
    Tag,
    Star,
    Zap,
    MousePointerClick,
    Users,
    MessageSquare,
    Phone,
    Bot,
    Settings,
    Palette,
    LogOut,

    X,
    ChevronDown,
    ChevronRight
} from "lucide-react";

const navGroups = [
    {
        title: "Overview",
        items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        title: "Catalog",
        items: [
            { name: "Products", href: "/admin/content/products", icon: ShoppingBag },
            { name: "Categories", href: "/admin/content/categories", icon: Tag },
            { name: "Offers", href: "/admin/content/offers", icon: Megaphone },
            { name: "Club Tiers", href: "/admin/content/club", icon: Users },
        ]
    },
    {
        title: "Content",
        items: [
            { name: "Reviews", href: "/admin/content/reviews", icon: MessageSquare }, // Using MessageSquare as generic content icon
            { name: "Product Requests", href: "/admin/requests", icon: MessageSquare },
        ]
    },
    {
        title: "Storefront",
        items: [
            { name: "Hero Section", href: "/admin/content/hero", icon: LayoutDashboard },
            { name: "Highlights", href: "/admin/content/highlights", icon: Star },
            { name: "Features", href: "/admin/content/features", icon: Zap },
            { name: "CTA Section", href: "/admin/content/cta", icon: MousePointerClick },
            { name: "Products Page", href: "/admin/content/products-page", icon: ShoppingBag },
            { name: "Offers Page", href: "/admin/content/offers-page", icon: Megaphone },
            { name: "Departments Page", href: "/admin/content/departments-page", icon: Tag },
            { name: "About Us Page", href: "/admin/content/about", icon: Users },
            { name: "Station Info", href: "/admin/content/contact", icon: Phone },
            { name: "Branding", href: "/admin/content/branding", icon: Settings },
            { name: "Appearance", href: "/admin/appearance", icon: Palette },
        ]
    },
    {
        title: "System",
        items: [
            { name: "Staff Management", href: "/admin/staff", icon: Users },
            { name: "AI Assistant", href: "/admin/api-keys", icon: Bot },
        ]
    }
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
    const { user, logout, role } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        "Overview": true,
        "Catalog": true,
        "Content": true,
        "Storefront": false,
        "System": true
    });

    const handleLogout = async () => {
        await logout();
        router.push("/admin/login");
    };

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    if (!user) return null;

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-green text-white transform transition-transform duration-300 ease-in-out flex flex-col border-r border-white/10
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-serif tracking-tight">
                            Smart<span className="italic text-brand-gold">Avenue</span>
                        </h1>
                        <p className="text-brand-gold/60 text-xs uppercase tracking-widest mt-1">{role} Portal</p>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/70 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                    {navGroups.map((group) => {
                        // Filter items based on role
                        const filteredItems = group.items.filter(item => {
                            if (role !== "Admin" && (item.name === "Staff Management" || item.name === "Branding")) {
                                return false;
                            }
                            return true;
                        });

                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={group.title}>
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="flex items-center justify-between w-full px-3 mb-2 text-xs font-semibold text-brand-gold/70 uppercase tracking-wider hover:text-brand-gold transition-colors"
                                >
                                    {group.title}
                                    {expandedGroups[group.title] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>

                                {expandedGroups[group.title] && (
                                    <div className="space-y-0.5">
                                        {filteredItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = pathname === item.href;

                                            // Handle special active states (e.g. sub-pages)
                                            // If strict equality fails, check if pathname starts with href for basic nested routes (except root admin)
                                            const isSelected = isActive || (item.href !== "/admin" && pathname.startsWith(item.href));

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={`
                                                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                                        ${isSelected
                                                            ? "bg-white/10 text-white shadow-sm"
                                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                                        }
                                                    `}
                                                >
                                                    <Icon className={`w-4 h-4 ${isSelected ? "text-brand-gold" : "text-white/50"}`} />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-green font-bold text-xs">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                            <p className="text-xs text-brand-gold/70 truncate capitalize">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-white/60 rounded-lg transition-all text-xs font-medium border border-white/5 hover:border-red-500/20"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
