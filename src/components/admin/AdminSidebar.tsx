"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    LayoutDashboard,
    Home,
    ShoppingBag,
    Megaphone,
    Tag,
    Users,
    MessageSquare,
    Phone,
    Bot,
    Settings,
    Palette,
    LogOut,
    X,
    ChevronDown,
    ChevronRight,
    Store
} from "lucide-react";

// Define generic type for nav items to avoid TS errors in the component
type NavItem = {
    name: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    subItems?: { name: string; href: string }[];
};

type NavGroup = {
    title: string;
    items: NavItem[];
};

const navGroups: NavGroup[] = [
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
        title: "Store Design",
        items: [
            { name: "Branding", href: "/admin/content/branding", icon: Settings },
            { name: "Appearance", href: "/admin/appearance", icon: Palette },
            { name: "Station Info", href: "/admin/content/contact", icon: Phone },
        ]
    },
    {
        title: "Pages",
        items: [
            {
                name: "Homepage",
                icon: Home,
                href: "/admin/storefront",
                subItems: [
                    { name: "Hero Section", href: "/admin/content/hero" },
                    { name: "Highlights", href: "/admin/content/highlights" },
                    { name: "Promotions", href: "/admin/content/promotions" },
                    { name: "Features", href: "/admin/content/features" },
                    { name: "CTA Section", href: "/admin/content/cta" },
                ]
            },
            { name: "About Us", href: "/admin/content/about", icon: Users },
            { name: "Departments", href: "/admin/content/departments-page", icon: Tag },
            { name: "Shop Page", href: "/admin/content/products-page", icon: Store },
            { name: "Special Offers", href: "/admin/content/offers-page", icon: Megaphone },
        ]
    },
    {
        title: "Content",
        items: [
            { name: "Reviews", href: "/admin/content/reviews", icon: MessageSquare },
            { name: "Requests", href: "/admin/requests", icon: MessageSquare },
        ]
    },
    {
        title: "System",
        items: [
            { name: "Staff", href: "/admin/staff", icon: Users },
            { name: "AI Assistant", href: "/admin/api-keys", icon: Bot },
        ]
    }
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
    const { user, logout, role } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Manage expanded state for top-level groups
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        "Overview": true,
        "Catalog": true,
        "Store Design": true,
        "Pages": true,
        "Content": false,
        "System": false
    });

    // Manage expanded state for nested items (like Homepage)
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
        "Homepage": true
    });

    const handleLogout = async () => {
        await logout();
        router.push("/admin/login");
    };

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const toggleItem = (name: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedItems(prev => ({ ...prev, [name]: !prev[name] }));
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
                        // Filter entire groups based on role
                        if (role !== "Admin" && group.title === "System") {
                            return null;
                        }

                        // Filter items based on role within groups
                        // Note: Keeping it simple for now, if more granular permission is needed, logic goes here.
                        // For "Store Design" logic from previous version:
                        if (role !== "Admin" && group.title === "Store Design") {
                            // Assuming only admins can edit design? 
                            // Previous logic: if(item.name === "Branding" ...) return false.
                            // Since we grouped them, we can hide the whole group if needed, or filter items.
                            // Let's assume non-admins shouldn't see Store Design at all if they couldn't see Branding/Appearance.
                            return null;
                        }

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
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const hasSubItems = item.subItems && item.subItems.length > 0;

                                            // Check if parent or any child is active
                                            const isParentActive = item.href === pathname;
                                            const isChildActive = item.subItems?.some(sub => sub.href === pathname);
                                            const isActive = isParentActive || isChildActive;

                                            return (
                                                <div key={item.name}>
                                                    {/* Parent Item */}
                                                    <div className="relative">
                                                        <Link
                                                            href={item.href || "#"}
                                                            onClick={(e) => {
                                                                if (hasSubItems) {
                                                                    // If it has subitems, clicking the main link should probably just toggle or go to link?
                                                                    // Let's allow navigation if href exists, but also provide toggle button
                                                                    if (!item.href) e.preventDefault();
                                                                    // We don't auto-close mobile menu here if it's a parent with subitems, 
                                                                    // unless it's a direct link navigation.
                                                                    if (!hasSubItems) setMobileOpen(false);
                                                                } else {
                                                                    setMobileOpen(false);
                                                                }
                                                            }}
                                                            className={`
                                                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                                                ${isActive
                                                                    ? "bg-white/10 text-white shadow-sm"
                                                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                                                }
                                                            `}
                                                        >
                                                            <Icon className={`w-4 h-4 ${isActive ? "text-brand-gold" : "text-white/50"}`} />
                                                            <span className="flex-1">{item.name}</span>

                                                            {hasSubItems && (
                                                                <button
                                                                    onClick={(e) => toggleItem(item.name, e)}
                                                                    className="p-1 hover:bg-white/10 rounded"
                                                                >
                                                                    {expandedItems[item.name]
                                                                        ? <ChevronDown className="w-3 h-3 text-white/50" />
                                                                        : <ChevronRight className="w-3 h-3 text-white/50" />
                                                                    }
                                                                </button>
                                                            )}
                                                        </Link>
                                                    </div>

                                                    {/* Sub Items */}
                                                    {hasSubItems && expandedItems[item.name] && (
                                                        <div className="ml-9 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                                                            {item.subItems!.map((sub) => {
                                                                const isSubActive = pathname === sub.href;
                                                                return (
                                                                    <Link
                                                                        key={sub.href}
                                                                        href={sub.href}
                                                                        onClick={() => setMobileOpen(false)}
                                                                        className={`
                                                                            block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                                                                            ${isSubActive
                                                                                ? "text-brand-gold bg-white/5"
                                                                                : "text-white/50 hover:text-white hover:bg-white/5"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
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
