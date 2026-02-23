"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2, Images } from "lucide-react";
import CloudinaryWidget from "@/components/admin/CloudinaryWidget";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? "";

export default function MediaLibraryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Images className="w-6 h-6 text-amber-600" />
                            Media Library
                        </h1>
                        <p className="text-gray-500">
                            Browse, upload, and manage all your images and videos via Cloudinary
                        </p>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 flex-shrink-0">
                    <div className="mt-0.5 w-4 h-4 flex-shrink-0 text-amber-600">ℹ️</div>
                    <p className="text-sm text-amber-700">
                        You are viewing your Cloudinary media library. You may be asked to log in with your
                        Cloudinary credentials if you are not already authenticated.
                    </p>
                </div>

                {/* Widget */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex-1 flex flex-col min-h-[600px]">
                    <CloudinaryWidget
                        cloudName={CLOUDINARY_CLOUD_NAME}
                        apiKey={CLOUDINARY_API_KEY}
                    />
                </div>
            </div>
        </div>
    );
}
