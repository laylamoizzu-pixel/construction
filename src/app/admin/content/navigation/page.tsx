"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteConfig, updateSiteConfig } from "@/app/actions/site-config";
import { SiteConfig } from "@/types/site-config";
import { ArrowLeft, Save, Loader2, Navigation, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";

interface NavLink {
    label: string;
    href: string;
}

export default function NavigationEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [headerLinks, setHeaderLinks] = useState<NavLink[]>([]);
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
            // Load header links from config, or use defaults
            const links = data.headerLinks || [
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: "Offers", href: "/offers" },
                { label: "Departments", href: "/departments" },
                { label: "About Us", href: "/about" },
            ];
            setHeaderLinks(links);
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

        // Save headerLinks as part of the config
        const updatedConfig = { ...config, headerLinks } as SiteConfig & { headerLinks: NavLink[] };
        const result = await updateSiteConfig(updatedConfig as unknown as SiteConfig);

        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            alert("Failed to save: " + (result.error || "Unknown error"));
        }
        setSaving(false);
    };

    const addLink = () => {
        setHeaderLinks([...headerLinks, { label: "", href: "" }]);
    };

    const removeLink = (index: number) => {
        setHeaderLinks(headerLinks.filter((_, i) => i !== index));
    };

    const updateLink = (index: number, field: keyof NavLink, value: string) => {
        const updated = [...headerLinks];
        updated[index] = { ...updated[index], [field]: value };
        setHeaderLinks(updated);
    };

    const moveLink = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= headerLinks.length) return;
        const updated = [...headerLinks];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setHeaderLinks(updated);
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
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Navigation className="w-6 h-6 text-amber-600" />
                            Navigation Links
                        </h1>
                        <p className="text-gray-500">Manage the header navigation menu links</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Header Navigation</h2>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Link
                                </button>
                            </div>

                            <div className="space-y-3">
                                {headerLinks.map((link, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => moveLink(index, "up")}
                                                disabled={index === 0}
                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                                            >
                                                <GripVertical className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={link.label}
                                                onChange={(e) => updateLink(index, "label", e.target.value)}
                                                placeholder="Link Label"
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                            />
                                            <input
                                                type="text"
                                                value={link.href}
                                                onChange={(e) => updateLink(index, "href", e.target.value)}
                                                placeholder="/path"
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeLink(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {headerLinks.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        <Navigation className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p>No navigation links configured. Click &quot;Add Link&quot; to start.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                Preview
                            </h3>
                            <div className="flex items-center gap-4 bg-slate-800 px-6 py-3 rounded-xl">
                                {headerLinks.map((link, i) => (
                                    <span
                                        key={i}
                                        className={`text-sm font-medium px-3 py-1.5 rounded-full ${i === 0
                                            ? "bg-blue-500 text-white"
                                            : "text-white/70"
                                            }`}
                                    >
                                        {link.label || "Untitled"}
                                    </span>
                                ))}
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
                                Save Navigation
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
