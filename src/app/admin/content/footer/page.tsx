"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteConfig, updateSiteConfig } from "@/app/actions/site-config";
import { SiteConfig, FooterLink } from "@/types/site-config";
import {
    Loader2,
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Facebook,
    Instagram,
    Twitter,
    Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CloudinaryUpload from "@/components/CloudinaryUpload";

export default function FooterEditor() {
    const { user, permissions, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/admin/login");
            } else {
                const hasPermission = role === "Admin" || (permissions && (permissions.includes("footer") || permissions.includes("*")));
                if (!hasPermission) {
                    router.push("/admin");
                }
            }
        }
    }, [authLoading, user, role, permissions, router]);

    useEffect(() => {
        if (user) {
            loadConfig();
        }
    }, [user]);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = await getSiteConfig();
            setConfig(data);
        } catch (error) {
            console.error("Failed to load footer config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;

        setSaving(true);
        setSaved(false);

        const result = await updateSiteConfig(config);

        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            alert("Failed to save changes: " + (result.error || "Unknown error"));
        }
        setSaving(false);
    };

    const addLink = (section: 'shop' | 'company' | 'bottom') => {
        if (!config) return;
        const newLink: FooterLink = { name: "New Link", href: "#" };

        const newConfig = { ...config };
        if (section === 'shop') {
            newConfig.footer.navigation.shop.links.push(newLink);
        } else if (section === 'company') {
            newConfig.footer.navigation.company.links.push(newLink);
        } else {
            newConfig.footer.bottomLinks.push(newLink);
        }
        setConfig({ ...newConfig });
    };

    const removeLink = (section: 'shop' | 'company' | 'bottom', index: number) => {
        if (!config) return;
        const newConfig = { ...config };
        if (section === 'shop') {
            newConfig.footer.navigation.shop.links.splice(index, 1);
        } else if (section === 'company') {
            newConfig.footer.navigation.company.links.splice(index, 1);
        } else {
            newConfig.footer.bottomLinks.splice(index, 1);
        }
        setConfig({ ...newConfig });
    };

    const updateLink = (section: 'shop' | 'company' | 'bottom', index: number, field: 'name' | 'href', value: string) => {
        if (!config) return;
        const newConfig = { ...config };
        if (section === 'shop') {
            newConfig.footer.navigation.shop.links[index][field] = value;
        } else if (section === 'company') {
            newConfig.footer.navigation.company.links[index][field] = value;
        } else {
            newConfig.footer.bottomLinks[index][field] = value;
        }
        setConfig({ ...newConfig });
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Footer Settings</h1>
                        <p className="text-gray-500">Manage footer logo, text, social links, and navigation</p>
                    </div>
                </div>

                {loading || !config ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Logo Management */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-amber-500" />
                                Footer Logo
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo</label>
                                    <div className="mb-2">
                                        <CloudinaryUpload
                                            folder="branding/footer-logo"
                                            multiple={false}
                                            accept="image/*"
                                            currentImages={config.footer.logoUrl ? [config.footer.logoUrl] : []}
                                            onUpload={(files) => files[0] && setConfig({
                                                ...config,
                                                footer: { ...config.footer, logoUrl: files[0].url, logoPublicId: files[0].publicId }
                                            })}
                                            onRemoveImage={() => setConfig({
                                                ...config,
                                                footer: { ...config.footer, logoUrl: "", logoPublicId: "" }
                                            })}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={config.footer.logoUrl || ""}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            footer: { ...config.footer, logoUrl: e.target.value }
                                        })}
                                        placeholder="Or enter URL manually..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        This logo appears in the dark footer section. Will fallback to the main branding logo if not set.
                                    </p>
                                </div>
                                <div className="bg-brand-dark rounded-lg p-8 flex items-center justify-center border border-gray-200">
                                    <div className="relative w-48 h-12">
                                        {config.footer.logoUrl || config.branding.logoUrl ? (
                                            <Image
                                                src={config.footer.logoUrl || config.branding.logoUrl || ""}
                                                alt="Footer Logo Preview"
                                                fill
                                                className="object-contain brightness-0 invert"
                                            />
                                        ) : (
                                            <div className="w-full h-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 text-xs">
                                                No Logo Selected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tagline & Social */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800">General Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Footer Tagline</label>
                                    <textarea
                                        value={config.footer.tagline}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            footer: { ...config.footer, tagline: e.target.value }
                                        })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                            <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                                        </label>
                                        <input
                                            type="text"
                                            value={config.footer.socialLinks.facebook}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                footer: {
                                                    ...config.footer,
                                                    socialLinks: { ...config.footer.socialLinks, facebook: e.target.value }
                                                }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                            <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                                        </label>
                                        <input
                                            type="text"
                                            value={config.footer.socialLinks.instagram}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                footer: {
                                                    ...config.footer,
                                                    socialLinks: { ...config.footer.socialLinks, instagram: e.target.value }
                                                }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                            <Twitter className="w-4 h-4 text-sky-500" /> Twitter
                                        </label>
                                        <input
                                            type="text"
                                            value={config.footer.socialLinks.twitter}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                footer: {
                                                    ...config.footer,
                                                    socialLinks: { ...config.footer.socialLinks, twitter: e.target.value }
                                                }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(['shop', 'company'] as const).map((sectionKey) => {
                                const section = config.footer.navigation[sectionKey];
                                return (
                                    <div key={sectionKey} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <input
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newConfig = { ...config };
                                                    newConfig.footer.navigation[sectionKey].title = e.target.value;
                                                    setConfig({ ...newConfig });
                                                }}
                                                className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-amber-500 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addLink(sectionKey)}
                                                className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {section.links.map((link, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <input
                                                        value={link.name}
                                                        onChange={(e) => updateLink(sectionKey, idx, 'name', e.target.value)}
                                                        placeholder="Name"
                                                        className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-amber-500"
                                                    />
                                                    <input
                                                        value={link.href}
                                                        onChange={(e) => updateLink(sectionKey, idx, 'href', e.target.value)}
                                                        placeholder="URL"
                                                        className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-amber-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLink(sectionKey, idx)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Links */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Bottom Bar Links</h2>
                                <button
                                    type="button"
                                    onClick={() => addLink('bottom')}
                                    className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {config.footer.bottomLinks.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 items-center p-2 border border-gray-100 rounded-lg">
                                        <div className="flex-1 space-y-1">
                                            <input
                                                value={link.name}
                                                onChange={(e) => updateLink('bottom', idx, 'name', e.target.value)}
                                                placeholder="Name"
                                                className="w-full text-xs px-2 py-1 border border-gray-200 rounded"
                                            />
                                            <input
                                                value={link.href}
                                                onChange={(e) => updateLink('bottom', idx, 'href', e.target.value)}
                                                placeholder="URL"
                                                className="w-full text-xs px-2 py-1 border border-gray-200 rounded"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeLink('bottom', idx)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between sticky bottom-6 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                            {saved && (
                                <span className="text-green-600 text-sm font-medium">✓ Changes saved successfully!</span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="ml-auto flex items-center gap-2 px-8 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Update Footer Content
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
