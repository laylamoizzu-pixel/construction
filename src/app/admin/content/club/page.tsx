"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getClubTiers, updateClubTiers, ClubTier } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    CreditCard,
    Check,
    X,
    MoveUp,
    MoveDown
} from "lucide-react";
import Link from "next/link";

export default function ClubContentManager() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tiers, setTiers] = useState<ClubTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Form state for new tier
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTier, setNewTier] = useState<ClubTier>({
        id: "",
        name: "",
        price: "",
        benefits: [],
        color: "bg-gray-100 text-gray-800",
        recommended: false
    });
    const [newBenefit, setNewBenefit] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            loadTiers();
        }
    }, [user]);

    const loadTiers = async () => {
        setLoading(true);
        const data = await getClubTiers();
        setTiers(data);
        setLoading(false);
        setIsDirty(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await updateClubTiers(tiers);
        if (result.success) {
            setIsDirty(false);
            alert("Club tiers saved successfully!");
        } else {
            alert("Error saving: " + result.error);
        }
        setSaving(false);
    };

    const handleAddTier = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTier.name || !newTier.price) return;

        const tierToAdd = {
            ...newTier,
            id: newTier.name.toLowerCase().replace(/\s+/g, "-")
        };

        setTiers([...tiers, tierToAdd]);
        setShowAddForm(false);
        setNewTier({
            id: "",
            name: "",
            price: "",
            benefits: [],
            color: "bg-gray-100 text-gray-800",
            recommended: false
        });
        setIsDirty(true);
    };

    const handleDeleteTier = (index: number) => {
        if (confirm("Delete this tier?")) {
            const newTiers = [...tiers];
            newTiers.splice(index, 1);
            setTiers(newTiers);
            setIsDirty(true);
        }
    };

    const handleMoveTier = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === tiers.length - 1)
        ) return;

        const newTiers = [...tiers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newTiers[index], newTiers[targetIndex]] = [newTiers[targetIndex], newTiers[index]];
        setTiers(newTiers);
        setIsDirty(true);
    };

    const handleAddBenefitToNew = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBenefit.trim()) {
            setNewTier({
                ...newTier,
                benefits: [...newTier.benefits, newBenefit.trim()]
            });
            setNewBenefit("");
        }
    };

    const updateTierField = (index: number, field: keyof ClubTier, value: any) => {
        const newTiers = [...tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        setTiers(newTiers);
        setIsDirty(true);
    };

    const handleAddBenefitToExisting = (index: number) => {
        const benefit = prompt("Enter new benefit:");
        if (benefit) {
            const newTiers = [...tiers];
            newTiers[index].benefits = [...newTiers[index].benefits, benefit];
            setTiers(newTiers);
            setIsDirty(true);
        }
    };

    const removeBenefitFromExisting = (tierIndex: number, benefitIndex: number) => {
        const newTiers = [...tiers];
        newTiers[tierIndex].benefits.splice(benefitIndex, 1);
        setTiers(newTiers);
        setIsDirty(true);
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Club Tiers Manager</h1>
                        <p className="text-gray-500">Manage loyalty program tiers and benefits</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Tier
                        </button>
                        {isDirty && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-yellow-500 text-brand-dark font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        )}
                    </div>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8 animate-in slide-in-from-top-4">
                        <h3 className="font-semibold text-lg mb-4">Add New Tier</h3>
                        <form onSubmit={handleAddTier} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name</label>
                                    <input
                                        type="text"
                                        value={newTier.name}
                                        onChange={e => setNewTier({ ...newTier, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="e.g. Silver"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price / Year</label>
                                    <input
                                        type="text"
                                        value={newTier.price}
                                        onChange={e => setNewTier({ ...newTier, price: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="e.g. ₹999/year or Free"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Color Class</label>
                                    <select
                                        value={newTier.color}
                                        onChange={e => setNewTier({ ...newTier, color: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        <option value="bg-gray-100 text-gray-800">Gray (Silver)</option>
                                        <option value="bg-yellow-400 text-yellow-900">Gold</option>
                                        <option value="bg-slate-800 text-white border border-gold-400">Black (Platinum)</option>
                                        <option value="bg-brand-green text-white">Green</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newTier.recommended}
                                            onChange={e => setNewTier({ ...newTier, recommended: e.target.checked })}
                                            className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Recommended Tier?</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newBenefit}
                                        onChange={e => setNewBenefit(e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-lg"
                                        placeholder="Add a benefit..."
                                    />
                                    <button
                                        onClick={handleAddBenefitToNew}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {newTier.benefits.map((b, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                                            {b}
                                            <button
                                                type="button"
                                                onClick={() => setNewTier({
                                                    ...newTier,
                                                    benefits: newTier.benefits.filter((_, idx) => idx !== i)
                                                })}
                                                className="hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-gold text-brand-dark font-medium rounded-lg hover:shadow-lg"
                                >
                                    Add Tier
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tiers List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-gold mx-auto" />
                        </div>
                    ) : tiers.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No club tiers found. Add one to get started.</p>
                        </div>
                    ) : (
                        tiers.map((tier, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-6 items-start group">
                                <div className="flex flex-col gap-1 pt-2">
                                    <button
                                        onClick={() => handleMoveTier(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <MoveUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveTier(index, 'down')}
                                        disabled={index === tiers.length - 1}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <MoveDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            value={tier.name}
                                            onChange={e => updateTierField(index, 'name', e.target.value)}
                                            className="px-3 py-2 border rounded-lg font-bold text-lg"
                                            placeholder="Tier Name"
                                        />
                                        <input
                                            type="text"
                                            value={tier.price}
                                            onChange={e => updateTierField(index, 'price', e.target.value)}
                                            className="px-3 py-2 border rounded-lg text-brand-green font-semibold"
                                            placeholder="Price"
                                        />
                                        <select
                                            value={tier.color}
                                            onChange={e => updateTierField(index, 'color', e.target.value)}
                                            className="px-3 py-2 border rounded-lg"
                                        >
                                            <option value="bg-gray-100 text-gray-800">Gray (Silver)</option>
                                            <option value="bg-yellow-400 text-yellow-900">Gold</option>
                                            <option value="bg-slate-800 text-white border border-gold-400">Black (Platinum)</option>
                                            <option value="bg-brand-green text-white">Green</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-700">Benefits</label>
                                            <button
                                                onClick={() => handleAddBenefitToExisting(index)}
                                                className="text-xs text-brand-gold font-bold hover:underline"
                                            >
                                                + Add Benefit
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tier.benefits.map((benefit, bIndex) => (
                                                <span key={bIndex} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                    {benefit}
                                                    <button
                                                        onClick={() => removeBenefitFromExisting(index, bIndex)}
                                                        className="text-gray-400 hover:text-red-500 ml-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteTier(index)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
