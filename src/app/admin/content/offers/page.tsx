"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createOffer, getOffers, deleteOffer, updateOffer, Offer } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Plus,
    Trash2,
    Tag,
    Save,
    Pencil
} from "lucide-react";
import Link from "next/link";

export default function OffersEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newOffer, setNewOffer] = useState({ title: "", discount: "", description: "" });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            loadOffers();
        }
    }, [user]);

    const loadOffers = async () => {
        setLoading(true);
        const data = await getOffers();
        setOffers(data);
        setLoading(false);
    };

    const handleSaveOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let result;
        if (editingId) {
            result = await updateOffer(editingId, {
                title: newOffer.title,
                discount: newOffer.discount,
                description: newOffer.description,
            });
        } else {
            result = await createOffer(newOffer.title, newOffer.discount, newOffer.description);
        }

        if (result.success) {
            setNewOffer({ title: "", discount: "", description: "" });
            setShowForm(false);
            setEditingId(null);
            await loadOffers();
        }
        setSaving(false);
    };

    const handleEditClick = (offer: Offer) => {
        setNewOffer({
            title: offer.title,
            discount: offer.discount,
            description: offer.description,
        });
        setEditingId(offer.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setNewOffer({ title: "", discount: "", description: "" });
    };

    const handleDeleteOffer = async (id: string) => {
        if (confirm("Are you sure you want to delete this offer?")) {
            await deleteOffer(id);
            await loadOffers();
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
                        <h1 className="text-2xl font-bold text-gray-800">Offers Manager</h1>
                        <p className="text-gray-500">Create and manage promotional offers</p>
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
                        New Offer
                    </button>
                </div>

                {/* Create/Edit form */}
                {showForm && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 transition-all animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            {editingId ? "Edit Offer" : "Create New Offer"}
                        </h3>
                        <form onSubmit={handleSaveOffer} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newOffer.title}
                                        onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                                        placeholder="Summer Sale"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                                    <input
                                        type="text"
                                        value={newOffer.discount}
                                        onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                                        placeholder="20% OFF"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newOffer.description}
                                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                    placeholder="Get amazing discounts on all products..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
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
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingId ? "Save Changes" : "Save Offer"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Offers list */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Active Offers ({offers.length})</h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                        </div>
                    ) : offers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No offers yet. Create your first offer!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {offers.map((offer) => (
                                <div key={offer.id} className="p-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-amber-600 font-bold text-sm text-center">{offer.discount}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800">{offer.title}</h4>
                                        <p className="text-sm text-gray-500 truncate">{offer.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(offer)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit offer"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOffer(offer.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete offer"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
