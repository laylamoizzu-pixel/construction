"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteContent, updateSiteContent, OffersPageContent } from "@/app/actions";
import { Loader2, ArrowLeft, Save, FileText } from "lucide-react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";

const defaultContent: OffersPageContent = {
    heroTitle: "Weekly Offers",
    heroSubtitle: "Curated deals and premium privileges for our valued members.",
    heroImage: ""
};

export default function OffersPageEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState<OffersPageContent>(defaultContent);
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
        const data = await getSiteContent<OffersPageContent>("offers-page");
        if (data) {
            setContent({ ...defaultContent, ...data });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        const result = await updateSiteContent("offers-page", content as unknown as Record<string, unknown>);
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
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Offers Page Content</h1>
                        <p className="text-gray-500">Edit the content of the public offers page</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="space-y-6">
                            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Hero Section</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                                <input
                                    type="text"
                                    value={content.heroTitle}
                                    onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                                <textarea
                                    value={content.heroSubtitle}
                                    onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL (Optional)</label>
                                <input
                                    type="url"
                                    value={content.heroImage}
                                    onChange={(e) => setContent({ ...content, heroImage: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-500" />
                                Gharana Catalogue PDF
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Catalogue (PDF)</label>
                                <FileUpload
                                    folder="catalogues"
                                    accept="application/pdf"
                                    multiple={false}
                                    currentFiles={content.catalogueUrl ? [content.catalogueUrl] : []}
                                    onUpload={(files) => setContent({ ...content, catalogueUrl: files[0].url })}
                                    onRemove={() => setContent({ ...content, catalogueUrl: "" })}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    This PDF will be available for download on the public offers page.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catalogue Title</label>
                                    <input
                                        type="text"
                                        value={content.catalogueTitle || ""}
                                        onChange={(e) => setContent({ ...content, catalogueTitle: e.target.value })}
                                        placeholder="Gharana Catalog Vol. 4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catalogue Subtitle/Description</label>
                                    <input
                                        type="text"
                                        value={content.catalogueSubtitle || ""}
                                        onChange={(e) => setContent({ ...content, catalogueSubtitle: e.target.value })}
                                        placeholder="Access our complete digital inventory..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
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
