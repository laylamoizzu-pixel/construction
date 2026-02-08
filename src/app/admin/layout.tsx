"use client";

import { AuthProvider } from "@/context/auth-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                {/* Full-screen overlay that covers the parent Header/Footer */}
                <div className="fixed inset-0 z-50 bg-gray-100 overflow-auto">
                    {children}
                </div>
            </AuthProvider>
        </ErrorBoundary>
    );
}

