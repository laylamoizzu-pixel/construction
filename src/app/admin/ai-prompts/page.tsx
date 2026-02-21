"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    getAIPrompts,
    updateAIPrompt,
    seedDefaultPrompts
} from "@/app/actions/ai-prompts-actions";
import { AIPrompt, DEFAULT_PROMPTS } from "@/lib/prompt-defaults";
import {
    Loader2,
    ArrowLeft,
    Save,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Power,
    RefreshCw,
    Search,
    Edit3
} from "lucide-react";
import Link from "next/link";

type ToastType = "success" | "error";

interface Toast {
    message: string;
    type: ToastType;
}

export default function AIPromptsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    // All available prompts (merged DB + Defaults)
    const [prompts, setPrompts] = useState<AIPrompt[]>([]);

    // Editor state
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
    const [editedPromptText, setEditedPromptText] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    const loadPrompts = useCallback(async () => {
        setLoading(true);
        try {
            const dbPrompts = await getAIPrompts();

            // Merge db prompts over defaults for UI listing
            const dbMap = new Map(dbPrompts.map(p => [p.id, p]));

            const merged: AIPrompt[] = [];
            for (const [id, defaultPrompt] of Object.entries(DEFAULT_PROMPTS)) {
                merged.push(dbMap.get(id) || defaultPrompt);
            }

            setPrompts(merged);
        } catch (error) {
            console.error("Failed to load AI prompts:", error);
            setToast({ message: "Failed to load prompts", type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadPrompts();
        }
    }, [user, loadPrompts]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleSelectPrompt = (prompt: AIPrompt) => {
        if (selectedPromptId === prompt.id) {
            // Close editor
            setSelectedPromptId(null);
        } else {
            // Open editor
            setSelectedPromptId(prompt.id);
            setEditedPromptText(prompt.systemPrompt);
            setIsActive(prompt.isActive);
        }
    };

    const handleSavePrompt = async () => {
        if (!selectedPromptId) return;

        setSaving(true);
        try {
            const result = await updateAIPrompt(selectedPromptId, {
                systemPrompt: editedPromptText,
                isActive: isActive
            });

            if (result.success) {
                setToast({ message: "Prompt updated successfully!", type: "success" });
                // Update local state without full reload
                setPrompts(prev => prev.map(p =>
                    p.id === selectedPromptId
                        ? { ...p, systemPrompt: editedPromptText, isActive }
                        : p
                ));
            } else {
                setToast({ message: result.error || "Failed to update prompt", type: "error" });
            }
        } catch (error) {
            console.error("Save error:", error);
            setToast({ message: "An unexpected error occurred", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleSeedDefaults = async () => {
        if (!window.confirm("This will write all default prompts to the database, potentially overwriting customizations. Continue?")) return;

        setSeeding(true);
        try {
            const result = await seedDefaultPrompts();
            if (result.success) {
                setToast({ message: "Database seeded correctly.", type: "success" });
                await loadPrompts();
            } else {
                setToast({ message: result.error || "Failed to seed database", type: "error" });
            }
        } catch (error) {
            setToast({ message: "An unexpected error occurred", type: "error" });
        } finally {
            setSeeding(false);
        }
    };

    const filteredPrompts = prompts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

    if (authLoading || !user) {
        return (
            <div className="p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="h-20 bg-white rounded-2xl animate-pulse" />
                    <div className="flex gap-6">
                        <div className="w-1/3 h-96 bg-white rounded-2xl animate-pulse" />
                        <div className="w-2/3 h-96 bg-white rounded-2xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 min-h-screen bg-gray-50/50">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium border transition-all animate-[slideIn_0.3s_ease-out] ${toast.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                    }`}>
                    {toast.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    {toast.message}
                </div>
            )}

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Header covering full width */}
                <div className="col-span-1 lg:col-span-3">
                    <header className="mb-4">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-serif text-gray-800 tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    Prompt Registry
                                </h2>
                                <p className="text-gray-500 text-sm mt-1.5">
                                    Manage and tune the system instructions for every AI agent
                                </p>
                            </div>

                            <button
                                onClick={handleSeedDefaults}
                                disabled={seeding || loading}
                                className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm shadow-sm"
                                title="Write ALL defaults to database"
                            >
                                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                <span className="hidden sm:inline">Reset to Defaults</span>
                            </button>
                        </div>
                    </header>
                </div>

                {/* Left side: List of prompts */}
                <div className="col-span-1 border border-gray-200 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search agents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {loading ? (
                            <div className="p-4 text-center text-sm text-gray-500">Loading agents...</div>
                        ) : filteredPrompts.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">No agents found.</div>
                        ) : (
                            filteredPrompts.map(prompt => (
                                <button
                                    key={prompt.id}
                                    onClick={() => handleSelectPrompt(prompt)}
                                    className={`w-full text-left p-4 rounded-xl transition-all flex items-start justify-between gap-3 ${selectedPromptId === prompt.id
                                            ? "bg-indigo-50 border border-indigo-100 ring-1 ring-indigo-500/20"
                                            : "hover:bg-gray-50 border border-transparent"
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-800 text-sm tracking-tight">{prompt.name}</h3>
                                            {!prompt.isActive && (
                                                <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Off</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{prompt.description}</p>
                                    </div>
                                    <Edit3 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedPromptId === prompt.id ? "text-indigo-500" : "text-gray-300"}`} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right side: Editor */}
                <div className="col-span-1 lg:col-span-2 border border-gray-200 bg-white rounded-2xl shadow-sm h-[calc(100vh-200px)] flex flex-col hidden lg:flex">
                    {selectedPrompt ? (
                        <>
                            {/* Editor Header */}
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">{selectedPrompt.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{selectedPrompt.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-600 block">Agent Status</label>
                                        <button
                                            onClick={() => setIsActive(!isActive)}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-0"}`} />
                                        </button>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200 mx-2" />
                                    <button
                                        onClick={handleSavePrompt}
                                        disabled={saving}
                                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Prompt
                                    </button>
                                </div>
                            </div>

                            {/* Editor Body */}
                            <div className="flex-1 p-6 flex flex-col relative">
                                <label className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3 flex justify-between">
                                    <span>System Prompt Template</span>
                                    <span>Variables: {'{{key}}'}</span>
                                </label>
                                <textarea
                                    value={editedPromptText}
                                    onChange={(e) => setEditedPromptText(e.target.value)}
                                    className="flex-1 w-full bg-gray-50/50 border border-gray-200 rounded-xl p-4 font-mono text-sm resize-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 leading-relaxed shadow-inner"
                                    placeholder="Enter system prompt here..."
                                />

                                {!isActive && (
                                    <div className="absolute bottom-10 inset-x-10 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-amber-800 shadow-xl z-10 animate-[fadeIn_0.2s_ease-out]">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                        <p className="text-sm"><strong>This agent is currently disabled.</strong> It will not respond to LLM requests in the app. Toggle the status above to re-enable it.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                            <MessageSquare className="w-16 h-16 text-gray-200" />
                            <p>Select an AI agent from the list to edit its prompt</p>
                        </div>
                    )}
                </div>

                {/* Mobile version of Editor (shows below list on small screens) */}
                <div className="col-span-1 border border-gray-200 bg-white rounded-2xl shadow-sm flex flex-col lg:hidden mt-6 mb-20 relative">
                    {selectedPrompt ? (
                        <>
                            <div className="px-4 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-lg text-gray-800">{selectedPrompt.name}</h3>
                                    <button
                                        onClick={handleSavePrompt}
                                        disabled={saving}
                                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-medium text-sm transition flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Status</span>
                                    <button
                                        onClick={() => setIsActive(!isActive)}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-0"}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col min-h-[400px]">
                                <textarea
                                    value={editedPromptText}
                                    onChange={(e) => setEditedPromptText(e.target.value)}
                                    className="flex-1 min-h-[400px] w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm resize-none focus:bg-white"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="p-10 text-center text-gray-500 italic">
                            Select an agent above to edit
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
