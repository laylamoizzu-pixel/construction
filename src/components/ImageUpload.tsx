"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadedFile {
    url: string;
    path: string;
}

interface ImageUploadProps {
    onUpload: (files: UploadedFile[]) => void;
    folder: string;
    multiple?: boolean;
    maxFiles?: number;
    className?: string;
    currentImages?: string[];
    onRemove?: (index: number) => void;
}

export default function ImageUpload({
    onUpload,
    folder = "uploads",
    multiple = false,
    maxFiles = 5,
    className = "",
    currentImages = [],
    onRemove
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!multiple && files.length > 1) {
            setError("Please select only one file.");
            return;
        }

        if (multiple && maxFiles && (files.length + currentImages.length) > maxFiles) {
            setError(`You can only upload up to ${maxFiles} images.`);
            return;
        }

        setError(null);
        setUploading(true);
        setProgress(0);
        const newFiles: UploadedFile[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Check file size (max 20MB)
                if (file.size > 20 * 1024 * 1024) {
                    throw new Error(`File ${file.name} is too large (max 20MB)`);
                }

                // Check file type
                if (!file.type.startsWith("image/")) {
                    throw new Error(`File ${file.name} is not an image`);
                }

                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                const fullPath = `${folder}/${timestamp}_${safeName}`;

                // Use Client-Side SDK Reference
                const storageRef = ref(storage, fullPath);
                const uploadTask = uploadBytesResumable(storageRef, file);

                await new Promise<void>((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setProgress(Math.round(p));
                        },
                        (err) => {
                            console.error("Firebase Storage Upload Error:", err);
                            reject(err);
                        },
                        async () => {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            newFiles.push({ url, path: fullPath });
                            resolve();
                        }
                    );
                });
            }

            onUpload(newFiles);

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("Upload process error:", err);
            setError(err instanceof Error ? err.message : "Failed to upload image");
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {uploading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                            <span className="text-sm font-medium">{progress}%</span>
                        </div>
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading..." : multiple ? "Choose Images" : "Choose Image"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {error && (
                    <span className="text-sm text-red-500">{error}</span>
                )}
            </div>

            {/* Preview Grid */}
            {currentImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentImages.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <Image
                                src={url}
                                alt={`Uploaded image ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            {onRemove && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    title="Remove image"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
