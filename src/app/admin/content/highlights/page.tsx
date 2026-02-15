"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    getSiteContent,
    updateSiteContent,
    getDepartments,
    updateDepartments,
    getCategories,
    HighlightsContent,
    DepartmentContent,
    Category
} from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    Package,
    PenTool,
    Smile,
    Utensils,
    Home as HomeIcon,
    Smartphone,
    Cpu,
    LucideIcon,
    Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import CloudinaryUpload from "@/components/CloudinaryUpload";

const defaultHighlights: HighlightsContent = {
    title: "",
    subtitle: "",
    description: ""
};

const availableIcons: { name: string; icon: LucideIcon }[] = [
    { name: "Package", icon: Package },
    { name: "PenTool", icon: PenTool },
    { name: "Smile", icon: Smile },
    { name: "Utensils", icon: Utensils },
    { name: "Home", icon: HomeIcon },
    { name: "Smartphone", icon: Smartphone },
    { name: "Cpu", icon: Cpu },
];

const iconMap: Record<string, LucideIcon> = {
    PenTool,
    Smile,
    Utensils,
    Home: HomeIcon,
    Package,
    Smartphone,
    Cpu,
};

export default function HighlightsEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState<HighlightsContent>(defaultHighlights);
    const [departments, setDepartments] = useState<DepartmentContent[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

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
            const [highlightsData, deptData, catData] = await Promise.all([
                getSiteContent<HighlightsContent>("highlights"),
                getDepartments(),
                getCategories(),
            ]);
            if (highlightsData) {
                setContent({ ...defaultHighlights, ...highlightsData });
            }
            setDepartments(deptData);
            setCategories(catData);
        } catch (err) {
            setError("Failed to load content");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setError("");

        try {
            const [contentResult, deptResult] = await Promise.all([
                updateSiteContent("highlights", content as unknown as Record<string, unknown>),
                updateDepartments(departments),
            ]);

            if (contentResult.success && deptResult.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(contentResult.error || deptResult.error || "Failed to save some changes");
            }
        } catch (err) {
            setError("An error occurred while saving");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addDepartment = () => {
        setDepartments([
            ...departments,
            {
                id: crypto.randomUUID(),
                title: "New Department",
                description: "Description",
                image: "",
                icon: "Package",
                link: "",
            }
        ]);
    };

    const removeDepartment = (id: string) => {
        setDepartments(departments.filter(d => d.id !== id));
    };

    const updateDepartment = (id: string, field: keyof DepartmentContent, value: string) => {
        setDepartments(departments.map(d =>
            d.id === id ? { ...d, [field]: value } : d
        ));
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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Highlights Section</h1>
                            <p className="text-gray-500">Edit text and department cards for the Departments/Zones section</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave}>
                        {/* Section Text Fields */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Section Header</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                    <input
                                        type="text"
                                        value={content.subtitle}
                                        onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={content.description}
                                        onChange={(e) => setContent({ ...content, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">"View All" Button Label</label>
                                        <input
                                            type="text"
                                            value={content.viewAllLabel || ""}
                                            onChange={(e) => setContent({ ...content, viewAllLabel: e.target.value })}
                                            placeholder="e.g. View All Departments"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">"Explore" Card Label</label>
                                        <input
                                            type="text"
                                            value={content.exploreLabel || ""}
                                            onChange={(e) => setContent({ ...content, exploreLabel: e.target.value })}
                                            placeholder="e.g. Explore Zone"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Department Cards Section */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-amber-600" />
                                        Department Cards
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        The first 3 departments are displayed on the homepage Highlights section.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {departments.map((dept, index) => {
                                    const Icon = iconMap[dept.icon] || Package;
                                    const isHighlighted = index < 3;

                                    return (
                                        <div
                                            key={dept.id}
                                            className={`p-5 rounded-xl border transition-all ${isHighlighted
                                                ? "border-amber-200 bg-amber-50/30"
                                                : "border-gray-100 bg-gray-50/30"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isHighlighted ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-500"
                                                        }`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-600">
                                                        {isHighlighted ? `Homepage Card ${index + 1}` : `Card ${index + 1}`}
                                                    </span>
                                                    {isHighlighted && (
                                                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                                            Visible on Home
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDepartment(dept.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Department"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                                                        <input
                                                            type="text"
                                                            value={dept.title}
                                                            onChange={(e) => updateDepartment(dept.id, "title", e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                                                        <textarea
                                                            value={dept.description}
                                                            onChange={(e) => updateDepartment(dept.id, "description", e.target.value)}
                                                            rows={2}
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Icon</label>
                                                        <select
                                                            value={dept.icon}
                                                            onChange={(e) => updateDepartment(dept.id, "icon", e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                        >
                                                            {availableIcons.map((ic) => (
                                                                <option key={ic.name} value={ic.name}>
                                                                    {ic.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                                            <LinkIcon className="inline-block w-3 h-3 mr-1" />
                                                            Link to Category
                                                        </label>
                                                        <select
                                                            value={dept.link || ""}
                                                            onChange={(e) => updateDepartment(dept.id, "link", e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                        >
                                                            <option value="">Select a Category (Custom Link)</option>
                                                            {categories.map((cat) => (
                                                                <option key={cat.id} value={`/products?category=${cat.id}`}>
                                                                    {cat.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={dept.link || ""}
                                                            onChange={(e) => updateDepartment(dept.id, "link", e.target.value)}
                                                            placeholder="Or enter custom path: /custom-page"
                                                            className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Card Image</label>
                                                    <CloudinaryUpload
                                                        onUpload={(files) => {
                                                            if (files[0]) updateDepartment(dept.id, "image", files[0].url);
                                                        }}
                                                        folder="departments"
                                                        maxFiles={1}
                                                        currentImages={dept.image ? [dept.image] : []}
                                                        onRemoveImage={() => updateDepartment(dept.id, "image", "")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex justify-center">
                                <button
                                    type="button"
                                    onClick={addDepartment}
                                    className="flex items-center gap-2 text-gray-500 hover:text-amber-600 font-medium px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors border border-dashed border-gray-300 hover:border-amber-400"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Department Card
                                </button>
                            </div>
                        </div>

                        {/* Save Bar */}
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            {saved ? (
                                <span className="text-green-600 text-sm font-medium">✓ All changes saved successfully!</span>
                            ) : (
                                <span className="text-gray-400 text-sm">Unsaved changes will be lost.</span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
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
