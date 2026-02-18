"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductRequest, getProductRequests, updateRequestStatus } from "@/app/actions/request-actions";
import {
    Search, XCircle, ImageIcon, Loader2,
    Mail, Eye, Calendar, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";

export default function RequestManagement() {
    const [requests, setRequests] = useState<ProductRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<ProductRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
    const [note, setNote] = useState("");
    const [updating, setUpdating] = useState(false);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProductRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const filterRequests = useCallback(() => {
        let result = requests;

        if (statusFilter !== "ALL") {
            result = result.filter(r => r.status === statusFilter);
        }

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.productName.toLowerCase().includes(lower) ||
                r.description.toLowerCase().includes(lower) ||
                (r.brand && r.brand.toLowerCase().includes(lower)) ||
                (r.contactInfo && r.contactInfo.toLowerCase().includes(lower))
            );
        }

        setFilteredRequests(result);
    }, [requests, searchQuery, statusFilter]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    useEffect(() => {
        filterRequests();
    }, [filterRequests]);


    async function handleStatusUpdate(status: string) {
        if (!selectedRequest) return;
        setUpdating(true);
        try {
            const result = await updateRequestStatus(selectedRequest.id, status, note);
            if (result.success) {
                // Update local state
                setRequests(prev => prev.map(r =>
                    r.id === selectedRequest.id ? { ...r, status: status as ProductRequest["status"], notes: note } : r
                ));
                toast.success("Status updated successfully");
                setSelectedRequest(null);
                setNote("");
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while updating status");
        } finally {
            setUpdating(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "REVIEWED": return "bg-blue-100 text-blue-800 border-blue-200";
            case "FULFILLED": return "bg-green-100 text-green-800 border-green-200";
            case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {["ALL", "PENDING", "REVIEWED", "FULFILLED", "REJECTED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${statusFilter === status
                                ? "bg-brand-dark text-white border-brand-dark"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {status === "ALL" ? "All Requests" : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading requests...
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No requests found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {request.imageUrl ? (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                                                        <Image src={request.imageUrl} alt="" fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">{request.productName}</div>
                                                    <div className="text-gray-500 text-xs truncate max-w-[200px]">
                                                        {request.brand ? `${request.brand} • ` : ""}{request.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate max-w-[150px]">{request.contactInfo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {format(new Date(request.createdAt), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setNote(request.notes || "");
                                                }}
                                                className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedRequest.productName}</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Requested on {format(new Date(selectedRequest.createdAt), "PPP")}
                                </div>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Product Details</h4>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <label className="text-xs text-gray-500 block mb-1">Brand</label>
                                            <p className="font-medium text-gray-900">{selectedRequest.brand || "Not specified"}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <label className="text-xs text-gray-500 block mb-1">Description</label>
                                            <p className="text-gray-700 text-sm leading-relaxed">{selectedRequest.description}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <label className="text-xs text-gray-500 block mb-1">Price Range</label>
                                                <p className="font-medium text-gray-900">
                                                    {selectedRequest.minPrice ? `₹${selectedRequest.minPrice}` : "Any"} - {selectedRequest.maxPrice ? `₹${selectedRequest.maxPrice}` : "Any"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {selectedRequest.imageUrl && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Reference Image</h4>
                                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                                                <Image src={selectedRequest.imageUrl} alt="Reference" fill className="object-cover" />
                                                <a
                                                    href={selectedRequest.imageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-blue"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Info</h4>
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-blue-500" />
                                            <span className="font-medium">{selectedRequest.contactInfo}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-gray-100 pt-6">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin Actions</h4>
                                <div className="flex flex-col gap-4">
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Add private admin notes..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
                                        rows={2}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate("REVIEWED")}
                                            disabled={updating}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Mark Reviewed
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate("FULFILLED")}
                                            disabled={updating}
                                            className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Mark Fulfilled
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate("REJECTED")}
                                            disabled={updating}
                                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Reject Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
