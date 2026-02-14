"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteConfig, updateSiteConfig } from "@/app/actions/site-config";
import { SiteConfig } from "@/types/site-config";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { uploadToCloudinary } from "@/app/cloudinary-actions";

export default function AppearancePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

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
        const data = await getSiteConfig();
        setConfig(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;

        setSaving(true);
        const result = await updateSiteConfig(config);
        setSaving(false);

        if (result.success) {
            alert("Configuration saved successfully!");
        } else {
            alert("Failed to save configuration: " + result.error);
        }
    };

    const handleImageUpload = async (file: File, path: string, field: "branding.logoUrl") => {
        setUploading(true);
        try {
            // Convert file to base64 for server action
            const reader = new FileReader();
            const filePromise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
            });
            reader.readAsDataURL(file);
            const base64File = await filePromise;

            const result = await uploadToCloudinary(base64File, path, "image");

            if (result.success && result.url) {
                setConfig(prev => {
                    if (!prev) return null;
                    const newConfig = { ...prev };
                    if (field === "branding.logoUrl") {
                        newConfig.branding.logoUrl = result.url;
                    }
                    return newConfig;
                });
            } else {
                throw new Error(result.error || "Upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    if (authLoading || loading || !config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Site Appearance</h1>
                        <p className="text-gray-500">Customize your website&apos;s look and feel</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Branding Section */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-serif font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Branding & Identity
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                                <input
                                    type="text"
                                    value={config.branding.siteName}
                                    onChange={(e) => setConfig({ ...config, branding: { ...config.branding, siteName: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                                <input
                                    type="text"
                                    value={config.branding.tagline}
                                    onChange={(e) => setConfig({ ...config, branding: { ...config.branding, tagline: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 relative">
                                        {config.branding.logoUrl ? (
                                            <Image src={config.branding.logoUrl} alt="Logo" fill className="object-contain" unoptimized />
                                        ) : (
                                            <span className="text-xs text-gray-400">No Logo</span>
                                        )}
                                    </div>
                                    <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm flex items-center gap-2">
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        Upload New Logo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "branding", "branding.logoUrl")}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Theme Colors */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-serif font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Theme Colors
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color (Emerald)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={config.theme.primaryColor}
                                        onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primaryColor: e.target.value } })}
                                        className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={config.theme.primaryColor}
                                        onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primaryColor: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color (Gold)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={config.theme.secondaryColor}
                                        onChange={(e) => setConfig({ ...config, theme: { ...config.theme, secondaryColor: e.target.value } })}
                                        className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={config.theme.secondaryColor}
                                        onChange={(e) => setConfig({ ...config, theme: { ...config.theme, secondaryColor: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={config.theme.accentColor}
                                        onChange={(e) => setConfig({ ...config, theme: { ...config.theme, accentColor: e.target.value } })}
                                        className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={config.theme.accentColor}
                                        onChange={(e) => setConfig({ ...config, theme: { ...config.theme, accentColor: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>



                    {/* Features Visibility */}
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-serif font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Section Visibility
                        </h2>
                        <div className="space-y-3">
                            {config.sections && Object.entries(config.sections).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <span className="text-gray-700 font-medium capitalize">{(key || '').replace(/show/, '').replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={!!value}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                sections: { ...config.sections, [key]: e.target.checked }
                                            })}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
