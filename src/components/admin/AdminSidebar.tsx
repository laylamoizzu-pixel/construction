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
    Bot,
    LogOut,
    X,
    ChevronDown,
    ChevronRight,
    Store,
    Upload,
    Paintbrush,
    Palette,
    Smartphone,
    Settings,
    ClipboardList,
    Phone,
    FileText,
    Navigation2,
    Search
} from "lucide-react";
import UploadModal from "@/components/admin/UploadModal";

// Define generic type for nav items to avoid TS errors in the component
type NavItem = {
    name: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    subItems?: { name: string; href: string; permission?: string; uploadFolder?: string }[];
    permission?: string;
    uploadFolder?: string;
};

type NavGroup = {
    title: string;
    permission?: string;
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
            { name: "Products", href: "/admin/content/products", icon: ShoppingBag, permission: "products" },
            { name: "Categories", href: "/admin/content/categories", icon: Tag, permission: "categories" },
            { name: "Offers", href: "/admin/content/offers", icon: Megaphone, permission: "offers" },
        ]
    },
    {
        title: "Pages",
        items: [
            {
                name: "Homepage",
                icon: Home,
                href: "/admin/storefront",
                permission: "storefront",
                subItems: [
                    { name: "Hero Section", href: "/admin/content/hero", permission: "hero", uploadFolder: "hero" },
                    { name: "Highlights", href: "/admin/content/highlights", permission: "highlights", uploadFolder: "homepage" },
                    { name: "Promotions", href: "/admin/content/promotions", permission: "promotions", uploadFolder: "promotions" },
                    { name: "Features", href: "/admin/content/features", permission: "features", uploadFolder: "homepage" },
                    { name: "CTA Section", href: "/admin/content/cta", permission: "cta", uploadFolder: "homepage" },
                    { name: "Footer", href: "/admin/content/footer", permission: "footer", uploadFolder: "branding" },
                ]
            },
            { name: "About Us", href: "/admin/content/about", icon: Users, permission: "about", uploadFolder: "about" },
            { name: "Departments", href: "/admin/content/departments", icon: Tag, permission: "departments", uploadFolder: "departments" },
            { name: "Shop Page", href: "/admin/content/products-page", icon: Store, permission: "products-page", uploadFolder: "products" },
            { name: "Special Offers", href: "/admin/content/offers-page", icon: Megaphone, permission: "offers-page", uploadFolder: "offers" },
        ]
    },
    {
        title: "Content",
        items: [
            { name: "Reviews", href: "/admin/content/reviews", icon: MessageSquare, permission: "reviews", uploadFolder: "reviews" },
            { name: "Product Request", href: "/admin/requests", icon: ClipboardList, permission: "product-request" },
        ]
    },
    {
        title: "Design",
        items: [
            { name: "Mobile App", href: "/admin/branding", icon: Smartphone, permission: "branding" },
            { name: "Appearance", href: "/admin/appearance", icon: Palette, permission: "appearance" },
        ]
    },
    {
        title: "Miscellaneous",
        items: [
            { name: "Contact Info", href: "/admin/content/contact", icon: Phone, permission: "contact" },
            { name: "Privacy Policy", href: "/admin/content/privacy", icon: FileText, permission: "privacy" },
            { name: "Terms of Service", href: "/admin/content/terms", icon: FileText, permission: "terms" },
            { name: "Navigation", href: "/admin/content/navigation", icon: Navigation2, permission: "navigation" },
            { name: "SEO & Metadata", href: "/admin/content/seo", icon: Search, permission: "seo" },
        ]
    },
    {
        title: "System",
        items: [
            { name: "Staff", href: "/admin/staff", icon: Users, permission: "staff" },
            { name: "AI Assistant", href: "/admin/api-keys", icon: Bot, permission: "api-keys" },
            { name: "Settings", href: "/admin/settings", icon: Settings },
        ]
    }
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
    const { user, logout, role, permissions } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Manage expanded state for top-level groups
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        "Overview": true,
        "Catalog": true,
        "Pages": true,
        "Content": false,
        "Design": true,
        "Miscellaneous": false,
        "System": false
    });

    // Manage expanded state for nested items (like Homepage)
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
        "Homepage": true
    });

    // Upload Modal State
    const [uploadConfig, setUploadConfig] = useState<{
        isOpen: boolean;
        folder: string;
        title: string;
    }>({
        isOpen: false,
        folder: "",
        title: ""
    });

    const openUpload = (e: React.MouseEvent, folder: string, title: string) => {
        e.preventDefault();
        e.stopPropagation();
        setUploadConfig({
            isOpen: true,
            folder,
            title: `Upload to ${title}`
        });
    };

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
                        // Helper to check if a user has access
                        const hasAccess = (permission?: string) => {
                            if (role?.toLowerCase() === "admin" || (permissions && permissions.includes("*"))) return true;
                            if (!permission) return true;
                            return permissions && permissions.includes(permission);
                        };

                        // Filter items within groups based on permissions
                        const accessibleItems = group.items.filter(item => {
                            // If it's a parent with subitems, check if any subitem is accessible
                            if (item.subItems && item.subItems.length > 0) {
                                const accessibleSubItems = item.subItems.filter(sub => hasAccess(sub.permission));
                                // We'll modify the item to only include accessible subitems
                                if (accessibleSubItems.length > 0) {
                                    item.subItems = accessibleSubItems;
                                    return true;
                                }
                                return hasAccess(item.permission);
                            }
                            return hasAccess(item.permission);
                        });

                        if (accessibleItems.length === 0) return null;

                        // Special case: Only Admin can see System group for now, 
                        // unless we want to allow Managers with "staff" permission.
                        // Let's rely on the permission check above which handles "staff" and "api-keys".

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
                                        {accessibleItems.map((item) => {
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
                                                                        <div className="flex items-center justify-between group/sub">
                                                                            <span>{sub.name}</span>
                                                                        </div>
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

            <UploadModal
                isOpen={uploadConfig.isOpen}
                onClose={() => setUploadConfig(prev => ({ ...prev, isOpen: false }))}
                folder={uploadConfig.folder}
                title={uploadConfig.title}
            />
        </>
    );
}
