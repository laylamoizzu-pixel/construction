
import { getProductRequests, updateProductRequestStatus, ProductRequest } from "@/app/actions/product-requests";
import { format } from "date-fns";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
    const requests = await getProductRequests();

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Product Requests</h1>
                    <p className="text-slate-500">Manage customer requests for new inventory.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                    Total Requests: {requests.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Product</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Details</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <MessageSquare className="w-8 h-8 opacity-20" />
                                            <p>No product requests found yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <RequestRow key={req.id} request={req} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function RequestRow({ request }: { request: ProductRequest }) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
                <div className="font-medium text-slate-900">{request.productName}</div>
            </td>
            <td className="px-6 py-4">
                <div className="text-slate-500 max-w-xs truncate" title={request.description}>
                    {request.description || "—"}
                </div>
            </td>
            <td className="px-6 py-4">
                <StatusBadge status={request.status} />
            </td>
            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                {request.createdAt ? format(request.createdAt, "MMM d, yyyy") : "—"}
            </td>
            <td className="px-6 py-4 text-right">
                <form action={async () => {
                    "use server";
                    await updateProductRequestStatus(request.id, request.status === "pending" ? "reviewed" : "pending");
                }}>
                    <button
                        type="submit"
                        className="text-brand-blue hover:text-brand-dark font-medium text-xs transition-colors"
                    >
                        {request.status === "pending" ? "Mark Reviewed" : "Mark Pending"}
                    </button>
                </form>
            </td>
        </tr>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "fulfilled") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                <CheckCircle className="w-3 h-3" /> Fulfilled
            </span>
        );
    }
    if (status === "reviewed") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                <CheckCircle className="w-3 h-3" /> Reviewed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
            <Clock className="w-3 h-3" /> Pending
        </span>
    );
}
