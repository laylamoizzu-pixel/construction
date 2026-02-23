"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getStaffMembers, createStaffMember, updateStaffMember, deleteStaffMember, StaffMember } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Plus,
    Trash2,
    Users,
    Save,
    Shield,
    UserCheck,
    Pencil
} from "lucide-react";
import Link from "next/link";

const sections = [
    { id: "hero", label: "Hero Section" },
    { id: "highlights", label: "Highlights" },
    { id: "promotions", label: "Promotions" },
    { id: "features", label: "Features" },
    { id: "cta", label: "CTA Section" },
    { id: "footer", label: "Footer Section" },
    { id: "products", label: "Products" },
    { id: "categories", label: "Categories" },
    { id: "offers", label: "Offers" },
    { id: "reviews", label: "Reviews" },
    { id: "contact", label: "Contact Info" },
    { id: "departments", label: "Departments" },
    { id: "staff", label: "Staff Management" },
    { id: "api-keys", label: "AI & System Settings" },
];

export default function StaffManagement() {
    const { user, role, permissions, loading: authLoading } = useAuth();
    const router = useRouter();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newStaff, setNewStaff] = useState({
        name: "",
        email: "",
        role: "editor" as "admin" | "manager" | "editor",
        permissions: [] as string[]
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/admin/login");
            } else {
                // Check if user is Admin or has 'staff' permission
                const hasStaffPermission = role === "Admin" || (permissions && (permissions.includes("staff") || permissions.includes("*")));
                if (!hasStaffPermission) {
                    router.push("/admin");
                }
            }
        }
    }, [authLoading, user, role, permissions, router]);

    useEffect(() => {
        if (user) {
            loadStaff();
        }
    }, [user]);

    const loadStaff = async () => {
        setLoading(true);
        const data = await getStaffMembers();
        // Filter out admin users to prevent accidental deletion
        const nonAdminStaff = data.filter(member => member.role !== "admin");
        setStaff(nonAdminStaff);
        setLoading(false);
    };

    const handleSaveStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let result;
        if (editingId) {
            result = await updateStaffMember(editingId, {
                name: newStaff.name,
                email: newStaff.email,
                role: newStaff.role,
                permissions: newStaff.permissions
            });
        } else {
            result = await createStaffMember(
                newStaff.email,
                newStaff.name,
                newStaff.role,
                newStaff.permissions
            );
        }

        if (result.success) {
            setNewStaff({ name: "", email: "", role: "editor", permissions: [] });
            setShowForm(false);
            setEditingId(null);
            await loadStaff();
        }
        setSaving(false);
    };

    const handleEditClick = (member: StaffMember) => {
        setNewStaff({
            name: member.name,
            email: member.email,
            role: member.role,
            permissions: member.permissions || []
        });
        setEditingId(member.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setNewStaff({ name: "", email: "", role: "editor", permissions: [] });
    };

    const handleDeleteStaff = async (id: string) => {
        if (confirm("Are you sure you want to remove this staff member?")) {
            await deleteStaffMember(id);
            await loadStaff();
        }
    };

    const togglePermission = (sectionId: string) => {
        const newPerms = newStaff.permissions.includes(sectionId)
            ? newStaff.permissions.filter(p => p !== sectionId)
            : [...newStaff.permissions, sectionId];
        setNewStaff({ ...newStaff, permissions: newPerms });
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "admin": return <Shield className="w-4 h-4 text-red-500" />;
            case "manager": return <UserCheck className="w-4 h-4 text-blue-500" />;
            default: return <Pencil className="w-4 h-4 text-green-500" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin": return "bg-red-100 text-red-700";
            case "manager": return "bg-blue-100 text-blue-700";
            default: return "bg-green-100 text-green-700";
        }
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
                        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
                        <p className="text-gray-500">Manage team members and their permissions</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Staff
                    </button>
                </div>

                {/* Create/Edit form */}
                {showForm && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 transition-all animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            {editingId ? "Edit Staff Member" : "Add New Staff Member"}
                        </h3>
                        <form onSubmit={handleSaveStaff} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newStaff.name}
                                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                        placeholder="john@smartavenue.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as "admin" | "manager" | "editor" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="editor">Editor - Can edit assigned sections</option>
                                    <option value="manager">Manager - Can edit all content</option>
                                    <option value="admin">Admin - Full access</option>
                                </select>
                            </div>

                            {newStaff.role === "editor" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Permissions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {sections.map(section => (
                                            <button
                                                key={section.id}
                                                type="button"
                                                onClick={() => togglePermission(section.id)}
                                                className={`px-3 py-1 rounded-full text-sm transition-colors ${newStaff.permissions.includes(section.id)
                                                    ? "bg-amber-500 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {section.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
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
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingId ? "Save Changes" : "Add Staff"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Staff list */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Team Members ({staff.length})</h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                        </div>
                    ) : staff.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No staff members yet. Add your first team member!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {staff.map((member) => (
                                <div key={member.id} className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-gray-600 font-bold">{member.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-800">{member.name}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getRoleBadgeColor(member.role)}`}>
                                                {getRoleIcon(member.role)}
                                                {member.role}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                        {member.permissions.length > 0 && (
                                            <div className="flex gap-1 mt-1">
                                                {member.permissions.map(p => (
                                                    <span key={p} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                        {sections.find(s => s.id === p)?.label || p}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(member)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit member"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStaff(member.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove member"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info box */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                        <strong>Note:</strong> Staff members added here are for organizational purposes.
                        To allow them to log in, you must also create their account in Firebase Authentication.
                    </p>
                </div>
            </div>
        </div>
    );
}
