"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteContent, updateSiteContent, CTAContent } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Save,
} from "lucide-react";
import Link from "next/link";
import ImageUpload, { UploadedFile } from "@/components/ImageUpload";

const defaultCTA: CTAContent = {
    title: "Ready to experience the new standard?",
    text: "Join thousands of clients discovering their dream properties with Gharana Realtors.",
    ctaPrimary: "Start Shopping",
    ctaLink: "/products",
    ctaSecondary: "Chat with Us",
    backgroundImage: "",
    images: []
};

export default function CTAEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState<CTAContent>(defaultCTA);
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
        const data = await getSiteContent<CTAContent>("cta");
        if (data) {
            setContent({ ...defaultCTA, ...data });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        const result = await updateSiteContent("cta", content as unknown as Record<string, unknown>);
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
                        <h1 className="text-2xl font-bold text-gray-800">CTA Section</h1>
                        <p className="text-gray-500">Edit the call-to-action section at bottom of home page</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                                <input
                                    type="text"
                                    value={content.title}
                                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
                                <textarea
                                    value={content.text}
                                    onChange={(e) => setContent({ ...content, text: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button</label>
                                    <input
                                        type="text"
                                        value={content.ctaPrimary}
                                        onChange={(e) => setContent({ ...content, ctaPrimary: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <div className="mt-2">
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Link</label>
                                        <input
                                            type="text"
                                            value={content.ctaLink || ""}
                                            onChange={(e) => setContent({ ...content, ctaLink: e.target.value })}
                                            placeholder="/products"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button</label>
                                    <select
                                        value={content.ctaSecondary}
                                        onChange={(e) => setContent({ ...content, ctaSecondary: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="Chat with Us">Chat with Us (Opens AI Chat)</option>
                                        <option value="Create Account">Create Account (Link)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Images (Carousel)</label>
                                <p className="text-sm text-gray-500 mb-3">Upload multiple images to create an automatic sliding background. If no images are uploaded, the single background image URL below will be used.</p>

                                <ImageUpload
                                    folder="cta-backgrounds"
                                    multiple={true}
                                    currentImages={content.images || []}
                                    onUpload={(files: UploadedFile[]) => {
                                        const newImages = [...(content.images || []), ...files.map((f: UploadedFile) => f.url)];
                                        setContent({ ...content, images: newImages });
                                    }}
                                    onRemove={(index: number) => {
                                        const newImages = [...(content.images || [])];
                                        newImages.splice(index, 1);
                                        setContent({ ...content, images: newImages });
                                    }}
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Legacy Background Image URL (Fallback)</label>
                                <input
                                    type="url"
                                    value={content.backgroundImage}
                                    onChange={(e) => setContent({ ...content, backgroundImage: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
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
