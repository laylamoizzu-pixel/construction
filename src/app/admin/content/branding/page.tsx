"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteConfig, updateSiteConfig } from "@/app/actions/site-config";
import { SiteConfig } from "@/types/site-config";
import {
    Loader2,
    ArrowLeft,
    Save,
    Image as ImageIcon,
    FileImage,
    Palette,
    Share2
} from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

export default function BrandingEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

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
            console.error("Failed to load branding content:", error);
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

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Branding Settings</h1>
                        <p className="text-gray-500">Manage logo, favicon, and brand assets</p>
                    </div>
                </div>

                {loading || !config ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Logo & Favicon */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-amber-500" />
                                Logo & Favicon
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                                    <div className="mb-2">
                                        <ImageUpload
                                            folder="branding/logo"
                                            multiple={false}
                                            currentImages={config.branding.logoUrl ? [config.branding.logoUrl] : []}
                                            onUpload={(files) => files[0] && setConfig({
                                                ...config,
                                                branding: { ...config.branding, logoUrl: files[0].url }
                                            })}
                                            onRemove={() => setConfig({
                                                ...config,
                                                branding: { ...config.branding, logoUrl: "" }
                                            })}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={config.branding.logoUrl}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            branding: { ...config.branding, logoUrl: e.target.value }
                                        })}
                                        placeholder="Or enter URL manually..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
                                    <div className="mb-2">
                                        <ImageUpload
                                            folder="branding/favicon"
                                            multiple={false}
                                            currentImages={config.branding.faviconUrl ? [config.branding.faviconUrl] : []}
                                            onUpload={(files) => files[0] && setConfig({
                                                ...config,
                                                branding: { ...config.branding, faviconUrl: files[0].url }
                                            })}
                                            onRemove={() => setConfig({
                                                ...config,
                                                branding: { ...config.branding, faviconUrl: "" }
                                            })}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={config.branding.faviconUrl}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            branding: { ...config.branding, faviconUrl: e.target.value }
                                        })}
                                        placeholder="Or enter URL manually..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use .ico or .png (32x32 or 16x16)</p>
                                </div>
                            </div>
                        </div>

                        {/* Poster/Banner */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FileImage className="w-5 h-5 text-amber-500" />
                                Promotional Poster/Banner
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Poster Image</label>
                                <div className="mb-2">
                                    <ImageUpload
                                        folder="branding/poster"
                                        multiple={false}
                                        currentImages={config.branding.posterUrl ? [config.branding.posterUrl] : []}
                                        onUpload={(files) => files[0] && setConfig({
                                            ...config,
                                            branding: { ...config.branding, posterUrl: files[0].url }
                                        })}
                                        onRemove={() => setConfig({
                                            ...config,
                                            branding: { ...config.branding, posterUrl: "" }
                                        })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={config.branding.posterUrl}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        branding: { ...config.branding, posterUrl: e.target.value }
                                    })}
                                    placeholder="Or enter URL manually..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Site Identity */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-amber-500" />
                                Site Identity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                                    <input
                                        type="text"
                                        value={config.branding.siteName}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            branding: { ...config.branding, siteName: e.target.value }
                                        })}
                                        placeholder="Smart Avenue"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                                    <input
                                        type="text"
                                        value={config.branding.tagline}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            branding: { ...config.branding, tagline: e.target.value }
                                        })}
                                        placeholder="All your home needs, simplified."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                            {/* Color settings should generally be in Appearance, but ok to keep here if desired. 
                                For consistency with SiteConfig, we should update both places or decide on one.
                                Let's mirror what was there but map to theme config if needed, or keep branding colors if they exist in branding object.
                                Looking at legacy file, primaryColor/secondaryColor existed on branding object.
                                Looking at SiteConfig type in appearance page: config.theme.primaryColor.
                                Let's check if branding has colors in SiteConfig definition. 
                                Appearance page uses config.theme.
                                Let's see if we can consolidate. The user wants it user friendly. 
                                Duplicating color controls might be confusing if they don't sync.
                                I'll leave them here for now but map them to config.theme to ensure they update the actual theme.
                            */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={config.theme.primaryColor}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                theme: { ...config.theme, primaryColor: e.target.value }
                                            })}
                                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={config.theme.primaryColor}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                theme: { ...config.theme, primaryColor: e.target.value }
                                            })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={config.theme.secondaryColor}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                theme: { ...config.theme, secondaryColor: e.target.value }
                                            })}
                                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={config.theme.secondaryColor}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                theme: { ...config.theme, secondaryColor: e.target.value }
                                            })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-amber-500" />
                                Social Media Links
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                                    <input
                                        type="text"
                                        value={config.branding.instagramUrl || ""}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            branding: { ...config.branding, instagramUrl: e.target.value }
                                        })}
                                        placeholder="https://instagram.com/..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp URL</label>
                                    <input
                                        type="text"
                                        value={config.branding.whatsappUrl || ""}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            branding: { ...config.branding, whatsappUrl: e.target.value }
                                        })}
                                        placeholder="https://wa.me/..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {saved && (
                                <span className="text-green-600 text-sm">✓ Branding settings saved!</span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="ml-auto flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
