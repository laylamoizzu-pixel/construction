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
    Phone,
    Mail,
    MapPin,
    Clock
} from "lucide-react";
import Link from "next/link";

export default function ContactEditor() {
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
            console.error("Failed to load contact config:", error);
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
                        <h1 className="text-2xl font-bold text-gray-800">Contact Information</h1>
                        <p className="text-gray-500">Update store contact details</p>
                    </div>
                </div>

                {loading || !config ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    <MapPin className="w-4 h-4" />
                                    Store Address
                                </label>
                                <textarea
                                    value={config.contact.address}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        contact: { ...config.contact, address: e.target.value }
                                    })}
                                    placeholder="Shop No. 123, Main Market..."
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={config.contact.phone}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            contact: { ...config.contact, phone: e.target.value }
                                        })}
                                        placeholder="+91 98765 43210"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={config.contact.email}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            contact: { ...config.contact, email: e.target.value }
                                        })}
                                        placeholder="contact@gharanarealtors.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    <Clock className="w-4 h-4" />
                                    Store Opening Hours
                                </label>
                                <textarea
                                    value={config.contact.storeHours}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        contact: { ...config.contact, storeHours: e.target.value }
                                    })}
                                    placeholder="Monday - Sunday, 10 AM - 10 PM"
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            {/* Note: Store Hours are not in the current SiteConfig type. 
                                Providing a placeholder if User wants it back, but currently omitting to match type. 
                                Or could add to SiteConfig if critical. 
                                Let's hide it for now to ensure type safety, or add it to type.
                                User asked for "user friendly", so removing fields might be bad.
                                But SiteConfig doesn't have it.
                                I will add it to SiteConfig type in next step if I see it's missing here.
                                Wait, I just saw I didn't add storeHours to SiteConfig in previous step.
                                I'll comment it out or add it to type. 
                                To avoid context switching, I'll omit it for now and relying on what's in SiteConfig.
                            */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Google Maps Embed URL
                                </label>
                                <input
                                    type="url"
                                    value={config.contact.mapEmbedUrl || ""}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        contact: { ...config.contact, mapEmbedUrl: e.target.value }
                                    })}
                                    placeholder="https://www.google.com/maps/embed?..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Get this from Google Maps → Share → Embed a map
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                            {saved && (
                                <span className="text-green-600 text-sm">✓ Changes saved successfully!</span>
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
