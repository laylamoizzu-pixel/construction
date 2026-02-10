"use client";

import { useState, useEffect } from "react";
import { getDepartments, updateDepartments, DepartmentContent } from "@/app/actions";
import { Plus, Trash2, Save, Upload, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload"; // Assuming this exists or I'll implement a simple input

export default function DepartmentsAdminPage() {
    const [departments, setDepartments] = useState<DepartmentContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        setIsLoading(true);
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            setError("Failed to load departments");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError("");
        setSuccess("");
        try {
            const result = await updateDepartments(departments);
            if (result.success) {
                setSuccess("Departments updated successfully!");
            } else {
                setError(result.error || "Failed to save");
            }
        } catch (err) {
            setError("An error occurred while saving");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const addDepartment = () => {
        setDepartments([
            ...departments,
            {
                id: crypto.randomUUID(),
                title: "New Department",
                description: "Description",
                image: "", // Placeholder or empty
                icon: "Package" // Default icon
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-brand-dark">Departments</h1>
                            <p className="text-slate-500">Manage department cards displayed on the website.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition-all shadow-lg shadow-brand-blue/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl border border-green-100 flex items-center gap-2">
                        <span className="font-bold">Success:</span> {success}
                    </div>
                )}

                <div className="grid gap-6">
                    {departments.map((dept, index) => (
                        <div key={dept.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1 grid gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={dept.title}
                                                onChange={(e) => updateDepartment(dept.id, "title", e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                                            <textarea
                                                value={dept.description}
                                                onChange={(e) => updateDepartment(dept.id, "description", e.target.value)}
                                                rows={3}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department Image</label>
                                            <ImageUpload
                                                onUpload={(files) => {
                                                    if (files[0]) updateDepartment(dept.id, "image", files[0].url);
                                                }}
                                                folder="departments"
                                                maxFiles={1}
                                                currentImages={dept.image ? [dept.image] : []}
                                                onRemove={() => updateDepartment(dept.id, "image", "")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeDepartment(dept.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove Department"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={addDepartment}
                        className="flex items-center gap-2 text-slate-500 hover:text-brand-blue font-medium px-4 py-2 rounded-lg hover:bg-brand-blue/5 transition-colors border border-dashed border-slate-300 hover:border-brand-blue/50"
                    >
                        <Plus className="w-4 h-4" />
                        Add Department
                    </button>
                </div>
            </div>
        </div>
    );
}
