"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ShoppingBag, Image as ImageIcon, Settings, LogOut, Plus, Save, Trash2, Loader2 } from "lucide-react";
import { createOffer, getOffers, deleteOffer, Offer } from "@/app/actions";

export default function AdminPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("offers");

    // Offers state
    const [offers, setOffers] = useState<Offer[]>([]);
    const [offerTitle, setOfferTitle] = useState("");
    const [offerDiscount, setOfferDiscount] = useState("");
    const [offerDescription, setOfferDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loadingOffers, setLoadingOffers] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [user, authLoading, router]);

    // Fetch offers on load
    useEffect(() => {
        async function fetchOffers() {
            const data = await getOffers();
            setOffers(data);
            setLoadingOffers(false);
        }
        fetchOffers();
    }, []);

    const handleCreateOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const result = await createOffer(offerTitle, offerDiscount, offerDescription);
        if (result.success) {
            setOfferTitle("");
            setOfferDiscount("");
            setOfferDescription("");
            const data = await getOffers();
            setOffers(data);
        }
        setSubmitting(false);
    };

    const handleDeleteOffer = async (id: string) => {
        await deleteOffer(id);
        const data = await getOffers();
        setOffers(data);
    };

    const handleLogout = async () => {
        await logout();
        router.push("/admin/login");
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full hidden md:block">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-serif font-bold">Smart<span className="text-amber-400">Admin</span></h2>
                    <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                </div>
                <nav className="p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab("offers")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'offers' ? 'bg-amber-500 text-slate-900 font-bold' : 'hover:bg-white/10'}`}
                    >
                        <ShoppingBag className="w-5 h-5" /> Offers Manager
                    </button>
                    <button
                        onClick={() => setActiveTab("gallery")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'gallery' ? 'bg-amber-500 text-slate-900 font-bold' : 'hover:bg-white/10'}`}
                    >
                        <ImageIcon className="w-5 h-5" /> Gallery Update
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed">
                        <Settings className="w-5 h-5" /> Settings
                    </button>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {activeTab === 'offers' ? 'Manage Offers' : 'Update Gallery'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700 hidden sm:block">{user.email}</span>
                    </div>
                </header>

                {activeTab === 'offers' ? (
                    <div className="space-y-6">
                        <form onSubmit={handleCreateOffer} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-green-600" /> Add New Offer
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Offer Title (e.g., Summer Sale)"
                                    value={offerTitle}
                                    onChange={(e) => setOfferTitle(e.target.value)}
                                    className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Discount (e.g., 50% OFF)"
                                    value={offerDiscount}
                                    onChange={(e) => setOfferDiscount(e.target.value)}
                                    className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={offerDescription}
                                    onChange={(e) => setOfferDescription(e.target.value)}
                                    className="p-3 border rounded-lg w-full md:col-span-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Publish Offer
                            </button>
                        </form>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold mb-4">Active Offers</h3>
                            {loadingOffers ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            ) : offers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No offers yet. Create one above!</p>
                            ) : (
                                <div className="space-y-4">
                                    {offers.map((offer) => (
                                        <div key={offer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{offer.title}</h4>
                                                <p className="text-sm text-amber-600 font-medium">{offer.discount}</p>
                                                <p className="text-sm text-gray-500">{offer.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteOffer(offer.id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-green-600" /> Upload New Image
                            </h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Image upload coming soon!</p>
                                <p className="text-xs mt-2">Firebase Storage needs to be enabled</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
