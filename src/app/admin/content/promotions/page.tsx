"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteConfig, updateSiteConfig } from "@/app/actions/site-config";
import { SiteConfig, PromotionItem } from "@/types/site-config";
import {
    Loader2,
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Plus,
    Trash2,
    GripVertical,
    Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import Image from "next/image";

export default function PromotionsPage() {
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
            // Ensure promotions object exists even if fetching old config
            if (!data.promotions) {
                data.promotions = {
                    enabled: true,
                    title: "Special Offers",
                    items: []
                };
            }
            setConfig(data);
        } catch (error) {
            console.error("Failed to load site config:", error);
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

    const handleAddImages = (files: { url: string }[]) => {
        if (!config) return;

        const newItems: PromotionItem[] = files.map(file => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            imageUrl: file.url,
            active: true,
            title: "",
            link: ""
        }));

        setConfig({
            ...config,
            promotions: {
                ...config.promotions,
                items: [...config.promotions.items, ...newItems]
            }
        });
    };

    const handleRemoveItem = (index: number) => {
        if (!config) return;
        const newItems = [...config.promotions.items];
        newItems.splice(index, 1);
        setConfig({
            ...config,
            promotions: {
                ...config.promotions,
                items: newItems
            }
        });
    };

    const handleUpdateItem = (index: number, field: keyof PromotionItem, value: any) => {
        if (!config) return;
        const newItems = [...config.promotions.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setConfig({
            ...config,
            promotions: {
                ...config.promotions,
                items: newItems
            }
        });
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
                        <h1 className="text-2xl font-bold text-gray-800">Promotions & Banners</h1>
                        <p className="text-gray-500">Manage promotional posters and offers on the homepage</p>
                    </div>
                </div>

                {loading || !config ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Settings */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-amber-500" />
                                    Section Settings
                                </h3>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Show on Homepage</label>
                                    <input
                                        type="checkbox"
                                        checked={config.promotions.enabled}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            promotions: { ...config.promotions, enabled: e.target.checked }
                                        })}
                                        className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                                <input
                                    type="text"
                                    value={config.promotions.title}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        promotions: { ...config.promotions, title: e.target.value }
                                    })}
                                    placeholder="Special Offers"
                                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-amber-500" />
                                Add New Posters
                            </h3>
                            <ImageUpload
                                folder="promotions"
                                multiple={true}
                                onUpload={handleAddImages}
                                onRemove={() => { }} // Not used here as we manage list below
                            />
                        </div>

                        {/* Items List */}
                        <div className="space-y-4">
                            {config.promotions.items.map((item, index) => (
                                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                                    {/* Image Preview */}
                                    <div className="relative w-full md:w-48 aspect-video md:aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                        <Image
                                            src={item.imageUrl}
                                            alt="Promotion"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Edit Fields */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={item.title || ""}
                                                    onChange={(e) => handleUpdateItem(index, "title", e.target.value)}
                                                    placeholder="e.g. Summer Sale"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                <LinkIcon className="w-3 h-3" /> Link URL (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={item.link || ""}
                                                onChange={(e) => handleUpdateItem(index, "link", e.target.value)}
                                                placeholder="/products/category/sale"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={item.active}
                                                onChange={(e) => handleUpdateItem(index, "active", e.target.checked)}
                                                id={`active-${item.id}`}
                                                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                                            />
                                            <label htmlFor={`active-${item.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                                                Active
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {config.promotions.items.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No promotions added yet. Upload images to get started.</p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                            {saved && (
                                <span className="text-green-600 text-sm font-medium">✓ Changes saved successfully!</span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="ml-auto flex items-center gap-2 px-8 py-3 bg-brand-green hover:bg-emerald-900 text-white rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg font-medium"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
