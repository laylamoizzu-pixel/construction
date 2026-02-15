"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteContent, updateSiteContent, FeaturesContent } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Save,
    Plus,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import * as Icons from "lucide-react";
import Image from "next/image";
import CloudinaryUpload from "@/components/CloudinaryUpload";

// Helper to get available icons
const iconList = [
    "ShieldCheck", "Zap", "Globe", "CheckCircle2", "Package", "Star", "Heart", "TrendingUp"
];

const defaultFeatures: FeaturesContent = {
    title: "",
    subtitle: "",
    items: []
};

export default function FeaturesEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState<FeaturesContent>(defaultFeatures);
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
        const data = await getSiteContent<FeaturesContent>("features");
        if (data) {
            setContent({ ...defaultFeatures, ...data });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        const result = await updateSiteContent("features", content as unknown as Record<string, unknown>);
        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        setSaving(false);
    };

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...content.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setContent({ ...content, items: newItems });
    };

    const addItem = () => {
        setContent({
            ...content,
            items: [...content.items, { title: "New Feature", desc: "Description", icon: "Package" }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = content.items.filter((_, i) => i !== index);
        setContent({ ...content, items: newItems });
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
                        <h1 className="text-2xl font-bold text-gray-800">Features Section</h1>
                        <p className="text-gray-500">Edit values and features list</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Section Header */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4">Section Header</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Small Tag)</label>
                                    <input
                                        type="text"
                                        value={content.subtitle}
                                        onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
                                    <textarea
                                        value={content.title}
                                        onChange={(e) => setContent({ ...content, title: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Use \n for line breaks. Second line will be colored.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
                                    <textarea
                                        value={content.description || ""}
                                        onChange={(e) => setContent({ ...content, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feature Items */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Feature Items</h2>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {content.items.map((item, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-1 flex items-start justify-center pt-8">
                                                {(() => {
                                                    const isUrl = item.icon.startsWith("http") || item.icon.startsWith("/");

                                                    if (isUrl) {
                                                        return (
                                                            <div className="relative w-8 h-8">
                                                                <Image
                                                                    src={item.icon}
                                                                    alt="Feature icon"
                                                                    fill
                                                                    className="object-contain"
                                                                    unoptimized
                                                                />
                                                            </div>
                                                        );
                                                    }

                                                    const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ElementType;
                                                    return IconComponent ? <IconComponent className="w-6 h-6 text-gray-600" /> : null;
                                                })()}
                                            </div>
                                        </div>
                                        <div className="md:col-span-5 space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Icon Source</label>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <label className="flex items-center gap-1 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`icon-type-${index}`}
                                                            checked={!item.icon.startsWith("http") && !item.icon.startsWith("/")}
                                                            onChange={() => updateItem(index, 'icon', 'ShieldCheck')}
                                                            className="text-amber-500 focus:ring-amber-500"
                                                        />
                                                        <span className="text-sm">Standard Icon</span>
                                                    </label>
                                                    <label className="flex items-center gap-1 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`icon-type-${index}`}
                                                            checked={item.icon.startsWith("http") || item.icon.startsWith("/")}
                                                            onChange={() => updateItem(index, 'icon', '')}
                                                            className="text-amber-500 focus:ring-amber-500"
                                                        />
                                                        <span className="text-sm">Upload Custom</span>
                                                    </label>
                                                </div>

                                                {(!item.icon.startsWith("http") && !item.icon.startsWith("/")) ? (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Select Icon</label>
                                                        <select
                                                            value={item.icon}
                                                            onChange={(e) => updateItem(index, 'icon', e.target.value)}
                                                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                                                        >
                                                            {iconList.map(icon => (
                                                                <option key={icon} value={icon}>{icon}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Upload Icon</label>
                                                        <div className="flex gap-2 items-center">
                                                            <div className="flex-1">
                                                                <CloudinaryUpload
                                                                    folder="features"
                                                                    multiple={false}
                                                                    currentImages={item.icon ? [item.icon] : []}
                                                                    onUpload={(files) => {
                                                                        if (files.length > 0) {
                                                                            updateItem(index, 'icon', files[0].url);
                                                                        }
                                                                    }}
                                                                    onRemoveImage={() => updateItem(index, 'icon', '')}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-6">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                            <textarea
                                                value={item.desc}
                                                onChange={(e) => updateItem(index, 'desc', e.target.value)}
                                                rows={5}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            {saved && (
                                <span className="text-green-600 text-sm font-medium animate-pulse">✓ Changes saved successfully!</span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="ml-auto flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-amber-200"
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
