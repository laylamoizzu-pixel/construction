"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    getAISettings,
    updateAISettings,
    AISettings,
} from "@/app/actions/ai-settings-actions";
import {
    Loader2,
    ArrowLeft,
    Save,
    Bot,
    MessageSquare,
    Sparkles,
    Sliders,
    AlertTriangle,
    Zap,
    Mic,
    ShoppingBag,
    RotateCcw,
    Power,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";

type ToastType = "success" | "error";

interface Toast {
    message: string;
    type: ToastType;
}

export default function AISettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const [settings, setSettings] = useState<AISettings>({
        enabled: true,
        showVibeSelector: true,
        personaName: "Genie",
        greeting: "",
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 2048,
        providerPriority: "auto",
        maxRecommendations: 5,
        enableVoiceInput: false,
        enableProductRequests: true,
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAISettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load AI settings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadSettings();
        }
    }, [user, loadSettings]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateAISettings(settings);
            if (result.success) {
                setToast({ message: "AI settings saved successfully!", type: "success" });
            } else {
                setToast({ message: result.error || "Failed to save settings", type: "error" });
            }
        } catch (error) {
            console.error("Save error:", error);
            setToast({ message: "An unexpected error occurred", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
                            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                            <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                            <div className="h-4 w-3/4 bg-gray-100 rounded" />
                        </div>
                    ))}
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

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-green transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-serif text-gray-800 tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                AI Assistant Settings
                            </h2>
                            <p className="text-gray-500 text-sm mt-1.5">
                                Configure how Genie interacts with your customers
                            </p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="px-6 py-2.5 bg-brand-green text-white rounded-xl font-medium text-sm hover:bg-brand-green/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-green/20"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="space-y-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
                                <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                                <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* AI Status Card */}
                        <div className={`rounded-2xl p-6 border shadow-sm transition-all ${settings.enabled
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-red-50/50 border-red-200"
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.enabled
                                        ? "bg-emerald-500 shadow-lg shadow-emerald-200"
                                        : "bg-red-400 shadow-lg shadow-red-200"
                                        }`}>
                                        <Power className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            AI Assistant is {settings.enabled ? "Active" : "Disabled"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {settings.enabled
                                                ? "Customers can interact with the AI shopping assistant"
                                                : "The AI chat button will be hidden from your store"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${settings.enabled ? "bg-emerald-500" : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${settings.enabled ? "translate-x-7" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Persona & Greeting */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                Persona & Greeting
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assistant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.personaName}
                                        onChange={(e) => setSettings({ ...settings, personaName: e.target.value })}
                                        placeholder="Genie"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">This name appears in the chat header and greeting</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Welcome Greeting
                                    </label>
                                    <textarea
                                        value={settings.greeting}
                                        onChange={(e) => setSettings({ ...settings, greeting: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm resize-none"
                                        placeholder="Hi, I'm Genie! How can I help you today?"
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5">First message customers see when opening the chat</p>
                                </div>
                            </div>
                        </div>

                        {/* System Prompt */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-500" />
                                System Instructions
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom System Prompt
                                </label>
                                <textarea
                                    value={settings.systemPrompt}
                                    onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm resize-none font-mono"
                                    placeholder="Describe how the AI should behave, its tone, and any special instructions..."
                                />
                                <p className="text-xs text-gray-400 mt-1.5">
                                    This instruction is prepended to every AI interaction. Use it to control tone, behavior, and guidelines.
                                </p>
                            </div>
                        </div>

                        {/* Model Settings */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-teal-500" />
                                Model Configuration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Temperature
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={settings.temperature}
                                            onChange={(e) =>
                                                setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                                            }
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Precise (0)</span>
                                            <span className="font-semibold text-indigo-600">{settings.temperature}</span>
                                            <span>Creative (2)</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Tokens
                                    </label>
                                    <select
                                        value={settings.maxTokens}
                                        onChange={(e) =>
                                            setSettings({ ...settings, maxTokens: parseInt(e.target.value) })
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm bg-white"
                                    >
                                        <option value={512}>512 — Short responses</option>
                                        <option value={1024}>1024 — Medium</option>
                                        <option value={2048}>2048 — Detailed (Default)</option>
                                        <option value={4096}>4096 — Very detailed</option>
                                        <option value={8192}>8192 — Maximum</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Provider Priority
                                    </label>
                                    <select
                                        value={settings.providerPriority}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                providerPriority: e.target.value as "groq" | "google" | "auto",
                                            })
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm bg-white"
                                    >
                                        <option value="auto">Auto — Best available</option>
                                        <option value="groq">Groq (Llama) — Fastest</option>
                                        <option value="google">Google (Gemini) — Most capable</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1.5">Which AI provider to try first</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Recommendations
                                    </label>
                                    <select
                                        value={settings.maxRecommendations}
                                        onChange={(e) =>
                                            setSettings({ ...settings, maxRecommendations: parseInt(e.target.value) })
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm bg-white"
                                    >
                                        <option value={3}>3 products</option>
                                        <option value={5}>5 products (Default)</option>
                                        <option value={8}>8 products</option>
                                        <option value={10}>10 products</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Feature Toggles */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-orange-500" />
                                Feature Toggles
                            </h3>
                            <div className="space-y-4">
                                {[
                                    {
                                        key: "showVibeSelector" as keyof AISettings,
                                        label: "Shop by Vibe",
                                        description: "Show the AI-powered 'Shop by Vibe' section on the homepage",
                                        icon: Sparkles,
                                        color: "text-amber-500",
                                    },
                                    {
                                        key: "enableVoiceInput" as keyof AISettings,
                                        label: "Voice Input",
                                        description: "Allow customers to speak their queries (requires mic permission)",
                                        icon: Mic,
                                        color: "text-rose-500",
                                    },
                                    {
                                        key: "enableProductRequests" as keyof AISettings,
                                        label: "Product Requests",
                                        description: "Let customers request products that aren't in stock",
                                        icon: ShoppingBag,
                                        color: "text-blue-500",
                                    },
                                ].map((feature) => {
                                    const Icon = feature.icon;
                                    const isOn = settings[feature.key] as boolean;
                                    return (
                                        <div
                                            key={feature.key}
                                            className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`w-5 h-5 ${feature.color}`} />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{feature.label}</p>
                                                    <p className="text-xs text-gray-400">{feature.description}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, [feature.key]: !isOn })}
                                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isOn ? "bg-indigo-500" : "bg-gray-300"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isOn ? "translate-x-6" : "translate-x-0"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reset & Save Footer */}
                        <div className="flex items-center justify-between pt-2 pb-8">
                            <button
                                onClick={loadSettings}
                                className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset Changes
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-3 bg-brand-green text-white rounded-xl font-medium text-sm hover:bg-brand-green/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-green/20"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save All Settings
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
