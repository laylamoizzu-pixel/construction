"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteConfig, updateSiteConfig } from "@/app/actions/site-config";
import { SiteConfig, HeroSlide } from "@/types/site-config";
import {
    Loader2,
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Type,
    Link as LinkIcon,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown
} from "lucide-react";
import Link from "next/link";
import CloudinaryUpload from "@/components/CloudinaryUpload";

// Fallback for generating unique IDs without external dependency
const generateId = () => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export default function HeroEditor() {
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
            // Migration: if hero doesn't have slides but has old format, convert it
            if (!data.hero.slides && data.hero.title) {
                data.hero.slides = [{
                    id: generateId(),
                    title: data.hero.title,
                    subtitle: data.hero.subtitle || "",
                    ctaText: data.hero.ctaText || "Learn More",
                    ctaLink: data.hero.ctaLink || "/products",
                    learnMoreLink: data.hero.learnMoreLink,
                    backgroundImageUrl: data.hero.backgroundImageUrl || "",
                    overlayOpacity: data.hero.overlayOpacity || 0.6,
                }];
            }
            setConfig(data);
        } catch (error) {
            console.error("Failed to load hero content:", error);
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

    const addSlide = () => {
        if (!config) return;
        const newSlide: HeroSlide = {
            id: generateId(),
            title: "New Slide Title",
            subtitle: "New slide subtitle text goes here.",
            ctaText: "Learn More",
            ctaLink: "/products",
            backgroundImageUrl: "",
            overlayOpacity: 0.5,
        };
        setConfig({
            ...config,
            hero: {
                ...config.hero,
                slides: [...config.hero.slides, newSlide]
            }
        });
    };

    const removeSlide = (id: string) => {
        if (!config || config.hero.slides.length <= 1) return;
        setConfig({
            ...config,
            hero: {
                ...config.hero,
                slides: config.hero.slides.filter(s => s.id !== id)
            }
        });
    };

    const updateSlide = (id: string, updates: Partial<HeroSlide>) => {
        if (!config) return;
        setConfig({
            ...config,
            hero: {
                ...config.hero,
                slides: config.hero.slides.map(s => s.id === id ? { ...s, ...updates } : s)
            }
        });
    };

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        if (!config) return;
        const newSlides = [...config.hero.slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSlides.length) return;

        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
        setConfig({
            ...config,
            hero: { ...config.hero, slides: newSlides }
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
                        <h1 className="text-2xl font-bold text-gray-800">Hero Section</h1>
                        <p className="text-gray-500">Edit the homepage hero sliders and marketing content</p>
                    </div>
                </div>

                {loading || !config ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-700">Slides ({config.hero.slides.length})</h2>
                            <button
                                type="button"
                                onClick={addSlide}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Slide
                            </button>
                        </div>

                        {config.hero.slides.map((slide, index) => (
                            <div key={slide.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Slide Header */}
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-sm">#{index + 1}</span>
                                        <span className="font-medium text-gray-700 truncate max-w-[200px]">{slide.title || "Untitled Slide"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => moveSlide(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 hover:bg-gray-200 rounded-md disabled:opacity-30"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveSlide(index, 'down')}
                                            disabled={index === config.hero.slides.length - 1}
                                            className="p-1.5 hover:bg-gray-200 rounded-md disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeSlide(slide.id)}
                                            disabled={config.hero.slides.length <= 1}
                                            className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Text & CTAs */}
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-sm text-gray-500 uppercase flex items-center gap-2">
                                                <Type className="w-4 h-4" /> Content
                                            </h3>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Headline</label>
                                                <input
                                                    type="text"
                                                    value={slide.title}
                                                    onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                                                <textarea
                                                    value={slide.subtitle}
                                                    onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-sm text-gray-500 uppercase flex items-center gap-2">
                                                <LinkIcon className="w-4 h-4" /> Calls to Action
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">CTA 1 Text</label>
                                                    <input
                                                        type="text"
                                                        value={slide.ctaText}
                                                        onChange={(e) => updateSlide(slide.id, { ctaText: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">CTA 1 Link</label>
                                                    <input
                                                        type="text"
                                                        value={slide.ctaLink}
                                                        onChange={(e) => updateSlide(slide.id, { ctaLink: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Secondary Link (Learn More)</label>
                                                <input
                                                    type="text"
                                                    value={slide.learnMoreLink || ""}
                                                    onChange={(e) => updateSlide(slide.id, { learnMoreLink: e.target.value })}
                                                    placeholder="/offers"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Visuals */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-sm text-gray-500 uppercase mb-4 flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4" /> Background Image
                                            </h3>
                                            <CloudinaryUpload
                                                folder="hero"
                                                multiple={false}
                                                currentImages={slide.backgroundImageUrl ? [slide.backgroundImageUrl] : []}
                                                onUpload={(files) => files[0] && updateSlide(slide.id, { backgroundImageUrl: files[0].url })}
                                                onRemoveImage={() => updateSlide(slide.id, { backgroundImageUrl: "" })}
                                            />
                                            <div className="mt-4">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Image URL Override</label>
                                                <input
                                                    type="url"
                                                    value={slide.backgroundImageUrl}
                                                    onChange={(e) => updateSlide(slide.id, { backgroundImageUrl: e.target.value })}
                                                    placeholder="https://images.unsplash.com/..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-medium text-gray-500">Overlay Darkness</label>
                                                <span className="text-xs font-bold text-amber-600">{slide.overlayOpacity * 100}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={slide.overlayOpacity}
                                                onChange={(e) => updateSlide(slide.id, { overlayOpacity: parseFloat(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between sticky bottom-6 z-20">
                            {saved ? (
                                <span className="text-green-600 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                    <span className="bg-green-100 p-1 rounded-full"><Save className="w-3 h-3" /></span>
                                    Settings updated successfully!
                                </span>
                            ) : (
                                <span className="text-gray-400 text-sm italic">You have unsaved changes</span>
                            )}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-amber-200 disabled:opacity-50 active:scale-95"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? "Saving Changes..." : "Publish Updates"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
