"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getPageContent, updatePageContent } from "@/app/actions/page-content";
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react";
import Link from "next/link";

export default function PrivacyEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");
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
        try {
            const data = await getPageContent("privacy");
            setTitle(data.title);
            setContent(data.content);
            setLastUpdated(data.lastUpdated);
        } catch (error) {
            console.error("Failed to load privacy policy:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        const now = new Date();
        const updatedDate = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        const result = await updatePageContent("privacy", {
            title,
            content,
            lastUpdated: updatedDate,
        });

        if (result.success) {
            setLastUpdated(updatedDate);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            alert("Failed to save: " + (result.error || "Unknown error"));
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
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-amber-600" />
                            Privacy Policy Editor
                        </h1>
                        <p className="text-gray-500">Edit your store&apos;s privacy policy content</p>
                    </div>
                    <Link
                        href="/privacy"
                        target="_blank"
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        View Live Page →
                    </Link>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Page Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Privacy Policy"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Policy Content (HTML)
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={20}
                                        placeholder="Enter your privacy policy content in HTML format..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm leading-relaxed"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; to format your content.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Updated
                                    </label>
                                    <input
                                        type="text"
                                        value={lastUpdated}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        This updates automatically when you save.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                Preview
                            </h3>
                            <div
                                className="prose prose-lg prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
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
                                Save Privacy Policy
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
