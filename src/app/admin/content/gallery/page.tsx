"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getGalleryImages, addGalleryImage, deleteGalleryImage, GalleryImage } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Upload,
    Trash2,
    Image as ImageIcon,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import Link from "next/link";
import Image from "next/image";

export default function GalleryEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    // const [uploading, setUploading] = useState(false); // Removed unused state

    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            loadImages();
        }
    }, [user]);

    const loadImages = async () => {
        setLoading(true);
        const data = await getGalleryImages();
        setImages(data);
        setLoading(false);
    };

    const handleUpload = async (files: { url: string; path: string }[]) => {
        if (files.length === 0) return;

        // setUploading(true);
        try {
            for (const file of files) {
                await addGalleryImage(file.url, file.path);
            }
            await loadImages();
            setShowUpload(false);
        } catch (error) {
            console.error("Error adding gallery images:", error);
            alert("Failed to add images");
        } finally {
            // setUploading(false);
        }
    };

    const handleDeleteImage = async (id: string) => {
        if (confirm("Are you sure you want to delete this image?")) {
            await deleteGalleryImage(id);
            await loadImages();
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Gallery Manager</h1>
                        <p className="text-gray-500">Manage your gallery images</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                        Add Image
                    </button>
                </div>

                {/* Add image form */}
                {showUpload && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Upload Images</h3>
                        <ImageUpload
                            folder="gallery"
                            multiple
                            onUpload={handleUpload}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowUpload(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Gallery grid */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Gallery Images ({images.length})</h3>

                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No images yet. Add your first image!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                        src={image.imageUrl}
                                        alt="Gallery"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleDeleteImage(image.id)}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
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
