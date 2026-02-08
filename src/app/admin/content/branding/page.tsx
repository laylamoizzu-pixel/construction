"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteContent, updateSiteContent } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Save,
    Image,
    FileImage,
    Palette
} from "lucide-react";
import Link from "next/link";

interface BrandingContent {
    logoUrl: string;
    faviconUrl: string;
    posterUrl: string;
    siteName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
}

const defaultBranding: BrandingContent = {
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    posterUrl: "",
    siteName: "Smart Avenue",
    tagline: "All your home needs, simplified.",
    primaryColor: "#f59e0b",
    secondaryColor: "#1e293b"
};

export default function BrandingEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState<BrandingContent>(defaultBranding);
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
            loadContent();
        }
    }, [user]);

    const loadContent = async () => {
        setLoading(true);
        const data = await getSiteContent<BrandingContent>("branding");
        if (data) {
            setContent({ ...defaultBranding, ...data });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        const result = await updateSiteContent("branding", content);
        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
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

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Logo & Favicon */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Image className="w-5 h-5 text-amber-500" />
                                Logo & Favicon
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                    <input
                                        type="text"
                                        value={content.logoUrl}
                                        onChange={(e) => setContent({ ...content, logoUrl: e.target.value })}
                                        placeholder="/logo.png or https://..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                    {content.logoUrl && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                            <img
                                                src={content.logoUrl}
                                                alt="Logo preview"
                                                className="h-12 object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                                    <input
                                        type="text"
                                        value={content.faviconUrl}
                                        onChange={(e) => setContent({ ...content, faviconUrl: e.target.value })}
                                        placeholder="/favicon.ico or https://..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Poster Image URL</label>
                                <input
                                    type="text"
                                    value={content.posterUrl}
                                    onChange={(e) => setContent({ ...content, posterUrl: e.target.value })}
                                    placeholder="https://... (for homepage banner)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                                {content.posterUrl && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                        <img
                                            src={content.posterUrl}
                                            alt="Poster preview"
                                            className="max-h-40 object-contain rounded"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
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
                                        value={content.siteName}
                                        onChange={(e) => setContent({ ...content, siteName: e.target.value })}
                                        placeholder="Smart Avenue"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                                    <input
                                        type="text"
                                        value={content.tagline}
                                        onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                                        placeholder="All your home needs, simplified."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={content.primaryColor}
                                            onChange={(e) => setContent({ ...content, primaryColor: e.target.value })}
                                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={content.primaryColor}
                                            onChange={(e) => setContent({ ...content, primaryColor: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={content.secondaryColor}
                                            onChange={(e) => setContent({ ...content, secondaryColor: e.target.value })}
                                            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={content.secondaryColor}
                                            onChange={(e) => setContent({ ...content, secondaryColor: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
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
