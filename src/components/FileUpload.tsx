
"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadedFile {
    url: string;
    path: string;
}

interface FileUploadProps {
    onUpload: (files: UploadedFile[]) => void;
    folder: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    className?: string;
    currentFiles?: string[];
    onRemove?: (index: number) => void;
}

export default function FileUpload({
    onUpload,
    folder = "uploads",
    accept = "*/*",
    multiple = false,
    maxFiles = 5,
    className = "",
    currentFiles = [],
    onRemove
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!multiple && files.length > 1) {
            setError("Please select only one file.");
            return;
        }

        if (multiple && maxFiles && (files.length + currentFiles.length) > maxFiles) {
            setError(`You can only upload up to ${maxFiles} files.`);
            return;
        }

        setError(null);
        setUploading(true);
        const newFiles: UploadedFile[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Check file size (max 10MB for PDFs)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`File ${file.name} is too large (max 10MB)`);
                }

                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                const fullPath = `${folder}/${timestamp}_${safeName}`;
                const storageRef = ref(storage, fullPath);

                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                newFiles.push({ url, path: fullPath });
            }

            onUpload(newFiles);

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "Failed to upload file");
        } finally {
            setUploading(false);
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
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading..." : multiple ? "Choose Files" : "Choose File"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
                {error && (
                    <span className="text-sm text-red-500">{error}</span>
                )}
            </div>

            {/* Preview/File List */}
            {currentFiles.length > 0 && (
                <div className="space-y-2">
                    {currentFiles.map((url, index) => (
                        <div key={`${url}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-700 truncate hover:text-amber-600 hover:underline"
                                >
                                    {url.split('/').pop()?.split('?')[0] || "Download File"}
                                </a>
                            </div>
                            {onRemove && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
