"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteContent, updateSiteContent, AboutPageContent } from "@/app/actions";
import { Loader2, ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

const defaultContent: AboutPageContent = {
    heroTitle: "Smart Avenue",
    heroSubtitle: "Building the future of retail, right here in your city.",
    heroImage: "",
    visionTitle: "Redefining Retail in Patna",
    visionText1: "We are not just a store; we are a logistics ecosystem designed for modern living. Smart Avenue bridges the gap between premium global brands and optimal local convenience.",
    visionText2: "Our platform leverages cutting-edge technology to ensure that quality, affordability, and speed are not mutually exclusive, but the standard for every interaction.",
    visionImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
    statsCustomers: "10k+",
    statsSatisfaction: "98%",
    valuesTitle: "The Smart Standard",
    valuesSubtitle: "Driven by innovation, grounded in integrity.",
    values: [
        {
            title: "Verified Quality",
            desc: "Rigorous quality checks on 100% of inventory.",
            icon: "ShieldCheck",
            color: "text-brand-blue"
        },
        {
            title: "Global Access",
            desc: "Sourcing the best products from around the world.",
            icon: "Globe",
            color: "text-brand-lime"
        },
        {
            title: "Instant Service",
            desc: "Efficient billing and personalized assistance.",
            icon: "Zap",
            color: "text-orange-500"
        },
        {
            title: "Total Transparency",
            desc: "Clear pricing, no hidden fees, honest service.",
            icon: "CheckCircle2",
            color: "text-brand-dark"
        }
    ]
};

export default function AboutPageEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState<AboutPageContent>(defaultContent);
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
        const data = await getSiteContent<AboutPageContent>("about-page");
        if (data) {
            // Merge with default to ensure all fields exist (e.g. if new fields added later)
            setContent({ ...defaultContent, ...data });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        const result = await updateSiteContent("about-page", content as unknown as Record<string, unknown>);
        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        setSaving(false);
    };

    const updateValue = (index: number, field: string, value: string) => {
        const newValues = [...content.values];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newValues[index] as any)[field] = value;
        setContent({ ...content, values: newValues });
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
                        <h1 className="text-2xl font-bold text-gray-800">About Us Page Content</h1>
                        <p className="text-gray-500">Edit the content of the public About Us page</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Hero Section */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Hero Section</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                                    <input type="text" value={content.heroTitle} onChange={(e) => setContent({ ...content, heroTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                                    <textarea value={content.heroSubtitle} onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>
                        </div>

                        {/* Vision Section */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Vision Section</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vision Title</label>
                                    <input type="text" value={content.visionTitle} onChange={(e) => setContent({ ...content, visionTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vision Text (Paragraph 1)</label>
                                    <textarea value={content.visionText1} onChange={(e) => setContent({ ...content, visionText1: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vision Text (Paragraph 2)</label>
                                    <textarea value={content.visionText2} onChange={(e) => setContent({ ...content, visionText2: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vision Image</label>
                                    <ImageUpload
                                        folder="about"
                                        maxFiles={1}
                                        currentImages={content.visionImage ? [content.visionImage] : []}
                                        onUpload={(files) => files[0] && setContent({ ...content, visionImage: files[0].url })}
                                        onRemove={() => setContent({ ...content, visionImage: "" })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stats: Happy Customers</label>
                                        <input type="text" value={content.statsCustomers} onChange={(e) => setContent({ ...content, statsCustomers: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stats: Satisfaction Rate</label>
                                        <input type="text" value={content.statsSatisfaction} onChange={(e) => setContent({ ...content, statsSatisfaction: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Values Section */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Core Values</h3>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                                    <input type="text" value={content.valuesTitle} onChange={(e) => setContent({ ...content, valuesTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Subtitle</label>
                                    <input type="text" value={content.valuesSubtitle} onChange={(e) => setContent({ ...content, valuesSubtitle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {content.values.map((val, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                                <input type="text" value={val.title} onChange={(e) => updateValue(idx, "title", e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Icon (Lucide Name)</label>
                                                <input type="text" value={val.icon} onChange={(e) => updateValue(idx, "icon", e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                            <textarea value={val.desc} onChange={(e) => updateValue(idx, "desc", e.target.value)} rows={2} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
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
