import { useState } from "react";
import { ShoppingBag, Image as ImageIcon, Settings, LogOut, Plus, Upload, Save } from "lucide-react";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("offers");

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-dark text-white fixed h-full hidden md:block">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-serif font-bold">Smart<span className="text-brand-gold">Admin</span></h2>
                </div>
                <nav className="p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab("offers")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'offers' ? 'bg-brand-gold text-brand-dark font-bold' : 'hover:bg-white/10'}`}
                    >
                        <ShoppingBag className="w-5 h-5" /> Offers Manager
                    </button>
                    <button
                        onClick={() => setActiveTab("gallery")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'gallery' ? 'bg-brand-gold text-brand-dark font-bold' : 'hover:bg-white/10'}`}
                    >
                        <ImageIcon className="w-5 h-5" /> Gallery Update
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed">
                        <Settings className="w-5 h-5" /> Settings
                    </button>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
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
                        <div className="w-10 h-10 rounded-full bg-gray-300" />
                        <span className="font-medium text-gray-700">Admin User</span>
                    </div>
                </header>

                {activeTab === 'offers' ? (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-brand-green" /> Add New Offer
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input type="text" placeholder="Offer Title (e.g., Summer Sale)" className="p-3 border rounded-lg w-full" />
                                <input type="text" placeholder="Discount (e.g., 50% OFF)" className="p-3 border rounded-lg w-full" />
                                <input type="text" placeholder="Description" className="p-3 border rounded-lg w-full md:col-span-2" />
                            </div>
                            <button className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2">
                                <Save className="w-4 h-4" /> Publish Offer
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold mb-4">Active Offers</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-bold">Sample Offer {i}</h4>
                                            <p className="text-sm text-gray-500">Valid until Sunday</p>
                                        </div>
                                        <button className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-brand-green" /> Upload New Image
                            </h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Drag & Drop or Click to Upload</p>
                                <p className="text-xs mt-2">Supports JPG, PNG (Max 5MB)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-xl relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="text-white hover:text-red-400">
                                            <LogOut className="w-6 h-6 rotate-180" /> {/* Using LogOut as a delete icon alternative */}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
