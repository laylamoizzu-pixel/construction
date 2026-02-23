"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cloudinary: any;
    }
}

interface CloudinaryWidgetProps {
    cloudName: string;
    apiKey: string;
}

export default function CloudinaryWidget({ cloudName, apiKey }: CloudinaryWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<unknown>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initWidget = async () => {
            if (!scriptLoaded || !containerRef.current) return;

            // Destroy previous instance if it exists
            if (widgetRef.current) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (widgetRef.current as any).destroy?.();
                } catch { /* ignore */ }
            }

            try {
                // Import the server action inside useEffect to avoid issues with SSR/Client transition if any
                const { getMediaLibrarySignature } = await import("@/app/cloudinary-actions");
                const sigResult = await getMediaLibrarySignature();

                if (!sigResult.success) {
                    throw new Error(sigResult.error || "Failed to get signature");
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const widget = (window as any).cloudinary.createMediaLibrary(
                    {
                        cloud_name: cloudName,
                        api_key: apiKey,
                        signature: sigResult.signature,
                        timestamp: sigResult.timestamp,
                        remove_header: false,
                        max_files: "1",
                        insert_caption: "Insert",
                        inline_container: "#cloudinary-media-library-container",
                    },
                    {
                        insertHandler: (data: unknown) => {
                            console.log("Cloudinary asset selected:", data);
                        },
                    }
                );

                // For inline widgets, we still need to call show() to actually render/activate it 
                // in the specified container.
                widget.show();

                widgetRef.current = widget;

            } catch (err) {
                console.error("Failed to initialize Cloudinary Media Library:", err);
                setError("Failed to initialize Cloudinary Media Library. Please check your credentials.");
            }
        };

        if (scriptLoaded) {
            initWidget();
        }
    }, [scriptLoaded, cloudName, apiKey]);

    return (
        <div className="w-full flex-1 flex flex-col" style={{ height: "100%" }}>
            {/* Force the Cloudinary-injected iframe to fill the container */}
            <style>{`
                #cloudinary-media-library-container iframe {
                    width: 100% !important;
                    height: 100% !important;
                    min-height: 700px !important;
                    border: none !important;
                    display: block !important;
                }
            `}</style>

            <Script
                src="https://media-library.cloudinary.com/global/all.js"
                strategy="afterInteractive"
                onLoad={() => setScriptLoaded(true)}
                onError={() => setError("Failed to load the Cloudinary script. Please check your network connection.")}
            />

            {error ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 font-medium">{error}</p>
                    </div>
                </div>
            ) : !scriptLoaded ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
                        <p className="text-sm">Loading Media Library...</p>
                    </div>
                </div>
            ) : null}

            {/* The Cloudinary widget renders itself into this container */}
            <div
                id="cloudinary-media-library-container"
                ref={containerRef}
                className="w-full flex-1 rounded-xl overflow-hidden border border-gray-100"
                style={{ height: "calc(100vh - 220px)", minHeight: "700px" }}
            />
        </div>
    );
}
