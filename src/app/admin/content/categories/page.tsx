"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getCategories, createCategory, deleteCategory, updateCategory, Category } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Plus,
    Trash2,
    Folder,
    FolderOpen,
    ChevronRight,
    Pencil,
    Save
} from "lucide-react";
import Link from "next/link";

export default function CategoriesManager() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newName, setNewName] = useState("");
    const [parentId, setParentId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            loadCategories();
        }
    }, [user]);

    const loadCategories = async () => {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setSaving(true);

        let result;
        if (editingId) {
            const slug = newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            result = await updateCategory(editingId, {
                name: newName,
                slug,
                parentId,
            });
        } else {
            result = await createCategory(newName, parentId);
        }

        if (result.success) {
            setNewName("");
            setParentId(null);
            setShowForm(false);
            setEditingId(null);
            await loadCategories();
        }
        setSaving(false);
    };

    const handleEditClick = (category: Category) => {
        setNewName(category.name);
        setParentId(category.parentId);
        setEditingId(category.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setNewName("");
        setParentId(null);
    };

    const handleDelete = async (id: string) => {
        const hasChildren = categories.some(c => c.parentId === id);
        if (hasChildren) {
            alert("Cannot delete category with subcategories. Delete subcategories first.");
            return;
        }
        if (confirm("Are you sure you want to delete this category?")) {
            await deleteCategory(id);
            await loadCategories();
        }
    };

    const mainCategories = categories.filter(c => !c.parentId);
    const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);

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
                        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                        <p className="text-gray-500">Manage product sections and subsections</p>
                    </div>
                    <button
                        onClick={() => {
                            if (showForm && !editingId) {
                                handleCancel();
                            } else {
                                handleCancel();
                                setShowForm(true);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>

                {/* Create/Edit form */}
                {showForm && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 transition-all animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            {editingId ? "Edit Category" : "Add New Category"}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Home Decor"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (optional)</label>
                                <select
                                    value={parentId || ""}
                                    onChange={(e) => setParentId(e.target.value || null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">None (Main Category)</option>
                                    {mainCategories.filter(cat => cat.id !== editingId).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingId ? "Save Changes" : "Save Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories list */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">All Categories ({categories.length})</h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No categories yet. Create your first category!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {mainCategories.map((category) => {
                                const subs = getSubcategories(category.id);
                                return (
                                    <div key={category.id}>
                                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                {subs.length > 0 ? (
                                                    <FolderOpen className="w-5 h-5 text-amber-600" />
                                                ) : (
                                                    <Folder className="w-5 h-5 text-amber-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800">{category.name}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {subs.length} subcategories
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(category)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit category"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete category"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        {subs.map(sub => (
                                            <div key={sub.id} className="p-4 pl-14 flex items-center gap-4 bg-gray-50/50 border-l-4 border-amber-200">
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                                <div className="flex-1">
                                                    <h4 className="text-gray-700">{sub.name}</h4>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(sub)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit subcategory"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(sub.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete subcategory"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
