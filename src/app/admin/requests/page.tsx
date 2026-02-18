"use client";

import RequestManagement from "@/components/admin/RequestManagement";

export default function RequestsPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold font-serif text-gray-900">Product Requests</h1>
                <p className="text-gray-500">Manage genie requests from users.</p>
            </div>

            <RequestManagement />
        </div>
    );
}
