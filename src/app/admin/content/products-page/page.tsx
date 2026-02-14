"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteContent, updateSiteContent, ProductsPageContent } from "@/app/actions";
import { Loader2, ArrowLeft, Save, Search, ListFilter, IndianRupee, Layers, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import CloudinaryUpload from "@/components/CloudinaryUpload";

const defaultContent: ProductsPageContent = {
    heroTitle: "Our Box",
    heroSubtitle: "Browse our curated collection of premium products.",
    heroImage: "",
    showSearch: true,
    showSort: true,
    showPriceRange: true,
    showCategories: true,
    showAvailability: true
};

export default function ProductsPageEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState<ProductsPageContent>(defaultContent);
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
        const data = await getSiteContent<ProductsPageContent>("products-page");
        if (data) {
            setContent({ ...defaultContent, ...data });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        const result = await updateSiteContent("products-page", content as unknown as Record<string, unknown>);
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
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Products Page Content</h1>
                        <p className="text-gray-500">Edit the content and configuration of the public products page</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="space-y-6">
                                <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Hero Section</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
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
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                                        <CloudinaryUpload
                                            folder="products"
                                            multiple={false}
                                            currentImages={content.heroImage ? [content.heroImage] : []}
                                            onUpload={(files) => files[0] && setContent({ ...content, heroImage: files[0].url })}
                                            onRemoveImage={() => setContent({ ...content, heroImage: "" })}
                                        />
                                        <div className="mt-4">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL Override</label>
                                            <input
                                                type="url"
                                                value={content.heroImage}
                                                onChange={(e) => setContent({ ...content, heroImage: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Sidebar Filters Visibility</h3>
                            <p className="text-sm text-gray-500 mb-6">Choose which filter sections are visible to users on the products page.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FilterToggle
                                    label="Search"
                                    icon={<Search className="w-4 h-4" />}
                                    checked={content.showSearch ?? true}
                                    onChange={(val) => setContent({ ...content, showSearch: val })}
                                />
                                <FilterToggle
                                    label="Sort Options"
                                    icon={<ListFilter className="w-4 h-4" />}
                                    checked={content.showSort ?? true}
                                    onChange={(val) => setContent({ ...content, showSort: val })}
                                />
                                <FilterToggle
                                    label="Price Range"
                                    icon={<IndianRupee className="w-4 h-4" />}
                                    checked={content.showPriceRange ?? true}
                                    onChange={(val) => setContent({ ...content, showPriceRange: val })}
                                />
                                <FilterToggle
                                    label="Categories"
                                    icon={<Layers className="w-4 h-4" />}
                                    checked={content.showCategories ?? true}
                                    onChange={(val) => setContent({ ...content, showCategories: val })}
                                />
                                <FilterToggle
                                    label="Availability"
                                    icon={<CheckCircle2 className="w-4 h-4" />}
                                    checked={content.showAvailability ?? true}
                                    onChange={(val) => setContent({ ...content, showAvailability: val })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            {saved && (
                                <span className="text-green-600 text-sm font-medium">✓ Changes saved successfully!</span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="ml-auto flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-amber-200 disabled:opacity-50 active:scale-95"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function FilterToggle({ label, icon, checked, onChange }: { label: string; icon: React.ReactNode; checked: boolean; onChange: (val: boolean) => void }) {
    return (
        <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${checked ? "bg-amber-50 border-amber-200 ring-2 ring-amber-500/10" : "bg-white border-gray-200 hover:border-gray-300"}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${checked ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {icon}
                </div>
                <span className={`font-medium ${checked ? "text-amber-900" : "text-gray-700"}`}>{label}</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? "bg-amber-500" : "bg-gray-200"}`}>
                <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
            </div>
        </label>
    );
}
