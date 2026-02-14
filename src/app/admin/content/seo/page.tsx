"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteConfig, updateSiteConfig } from "@/app/actions/site-config";
import { SiteConfig } from "@/types/site-config";
import { ArrowLeft, Save, Loader2, Search, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface SeoConfig {
    siteTitle: string;
    titleTemplate: string;
    metaDescription: string;
    keywords: string[];
    ogImageUrl: string;
    twitterHandle: string;
    googleVerification: string;
    jsonLd: {
        name: string;
        url: string;
        logo: string;
        description: string;
        addressCountry: string;
        priceRange: string;
    };
}

const DEFAULT_SEO: SeoConfig = {
    siteTitle: "Smart Avenue 99 – All your home needs, simplified.",
    titleTemplate: "%s | Smart Avenue 99",
    metaDescription: "We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, durable plasticware, quality crockery, cosmetics, premium stationery, soft toys, and thoughtfully curated gift items.",
    keywords: [
        "Smart Avenue 99 retail store",
        "premium stationery store",
        "stylish stationery products",
        "affordable home décor store",
        "kitchen décor products",
        "soft toys shop",
        "home essentials store",
        "retail store near me",
        "gift shop",
        "online shopping",
    ],
    ogImageUrl: "https://smartavenue99.com/logo.png",
    twitterHandle: "@smartavenue99",
    googleVerification: "P58XCY_8uZe5I7QC5eNh2wivKElDpu2ckaI60IgD5yc",
    jsonLd: {
        name: "Smart Avenue 99",
        url: "https://smartavenue99.com",
        logo: "https://smartavenue99.com/logo.png",
        description: "One-stop departmental store offering home essentials, decor, kitchenware, and gifts.",
        addressCountry: "IN",
        priceRange: "₹₹",
    },
};

export default function SeoEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [seo, setSeo] = useState<SeoConfig>(DEFAULT_SEO);
    const [newKeyword, setNewKeyword] = useState("");
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
            const existingSeo = (data as SiteConfig & { seo?: SeoConfig }).seo;
            if (existingSeo) {
                setSeo({ ...DEFAULT_SEO, ...existingSeo });
            }
        } catch (error) {
            console.error("Failed to load config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;
        setSaving(true);
        setSaved(false);

        const updatedConfig = { ...config, seo } as SiteConfig & { seo: SeoConfig };
        const result = await updateSiteConfig(updatedConfig as unknown as SiteConfig);

        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            alert("Failed to save: " + (result.error || "Unknown error"));
        }
        setSaving(false);
    };

    const addKeyword = () => {
        if (newKeyword.trim() && !seo.keywords.includes(newKeyword.trim())) {
            setSeo({ ...seo, keywords: [...seo.keywords, newKeyword.trim()] });
            setNewKeyword("");
        }
    };

    const removeKeyword = (index: number) => {
        setSeo({ ...seo, keywords: seo.keywords.filter((_, i) => i !== index) });
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
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Search className="w-6 h-6 text-amber-600" />
                            SEO & Metadata
                        </h1>
                        <p className="text-gray-500">Manage search engine optimization settings</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Basic SEO */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                                Basic SEO
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Default Page Title
                                    </label>
                                    <input
                                        type="text"
                                        value={seo.siteTitle}
                                        onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title Template
                                    </label>
                                    <input
                                        type="text"
                                        value={seo.titleTemplate}
                                        onChange={(e) => setSeo({ ...seo, titleTemplate: e.target.value })}
                                        placeholder="%s | Smart Avenue 99"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Use %s as placeholder for the page name</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meta Description
                                    </label>
                                    <textarea
                                        value={seo.metaDescription}
                                        onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {seo.metaDescription.length}/160 characters recommended
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                                Keywords
                            </h2>
                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                                    placeholder="Add a keyword..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={addKeyword}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {seo.keywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        {keyword}
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(index)}
                                            className="p-0.5 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Social & Verification */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                                Social & Verification
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        OG Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={seo.ogImageUrl}
                                        onChange={(e) => setSeo({ ...seo, ogImageUrl: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Twitter Handle
                                    </label>
                                    <input
                                        type="text"
                                        value={seo.twitterHandle}
                                        onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                                        placeholder="@yourhandle"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Google Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={seo.googleVerification}
                                        onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Structured Data */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                                Structured Data (JSON-LD)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                    <input
                                        type="text"
                                        value={seo.jsonLd.name}
                                        onChange={(e) => setSeo({ ...seo, jsonLd: { ...seo.jsonLd, name: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                    <input
                                        type="url"
                                        value={seo.jsonLd.url}
                                        onChange={(e) => setSeo({ ...seo, jsonLd: { ...seo.jsonLd, url: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                    <input
                                        type="url"
                                        value={seo.jsonLd.logo}
                                        onChange={(e) => setSeo({ ...seo, jsonLd: { ...seo.jsonLd, logo: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                                    <input
                                        type="text"
                                        value={seo.jsonLd.addressCountry}
                                        onChange={(e) => setSeo({ ...seo, jsonLd: { ...seo.jsonLd, addressCountry: e.target.value } })}
                                        placeholder="IN"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                                    <textarea
                                        value={seo.jsonLd.description}
                                        onChange={(e) => setSeo({ ...seo, jsonLd: { ...seo.jsonLd, description: e.target.value } })}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                                    <input
                                        type="text"
                                        value={seo.jsonLd.priceRange}
                                        onChange={(e) => setSeo({ ...seo, jsonLd: { ...seo.jsonLd, priceRange: e.target.value } })}
                                        placeholder="₹₹"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {saved && (
                                <span className="text-green-600 text-sm font-medium">✓ Changes saved successfully!</span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save SEO Settings
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
