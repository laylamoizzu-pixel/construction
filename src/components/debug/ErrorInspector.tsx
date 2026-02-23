"use client";

import React, { useState } from "react";
import { useDebug } from "@/context/DebugContext";
import { useAuth } from "@/context/auth-context";
import { AlertCircle, Terminal, X, ChevronDown, ChevronRight, Trash2, Bug } from "lucide-react";

export function ErrorInspector() {
    const { errors, clearErrors, isDebugMode, toggleDebugMode } = useDebug();
    const { role } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [expandedError, setExpandedError] = useState<string | null>(null);

    const isDevelopment = process.env.NODE_ENV === "development";
    const isAdmin = role === "Admin";

    // Only show if in development OR if the user is an Admin
    if (!isDevelopment && !isAdmin) return null;

    if (!isDebugMode && errors.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 font-sans">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all border
                    ${errors.length > 0
                        ? "bg-red-600 border-red-500 text-white animate-pulse"
                        : "bg-gray-900 border-gray-700 text-gray-300"}`}
            >
                {errors.length > 0 ? <AlertCircle size={18} /> : <Bug size={18} />}
                <span className="font-medium text-sm">
                    {errors.length > 0 ? `${errors.length} Technical Errors` : "Dev Tools"}
                </span>
            </button>

            {/* Error Panel */}
            {isOpen && (
                <div className="w-96 max-h-[70vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
                        <div className="flex items-center gap-2 text-gray-300">
                            <Terminal size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Error Inspector</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {errors.length > 0 && (
                                <button
                                    onClick={clearErrors}
                                    className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-red-400 transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {errors.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm italic">
                                No technical errors captured yet.
                            </div>
                        ) : (
                            errors.map((err) => (
                                <div
                                    key={err.id}
                                    className="border border-gray-800 rounded-lg overflow-hidden bg-gray-950/50"
                                >
                                    <button
                                        onClick={() => setExpandedError(expandedError === err.id ? null : err.id)}
                                        className="w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="mt-0.5">
                                            {expandedError === err.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-medium text-red-400 line-clamp-2 leading-tight">
                                                {err.message}
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                                                <span>{new Date(err.timestamp).toLocaleTimeString()}</span>
                                                {err.digest && <span className="font-mono">ID: {err.digest}</span>}
                                            </div>
                                        </div>
                                    </button>

                                    {expandedError === err.id && (
                                        <div className="px-3 pb-3 border-t border-gray-800/50 pt-2">
                                            {err.stack && (
                                                <div className="mb-2">
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Stack Trace</div>
                                                    <pre className="text-[11px] text-gray-400 bg-black/40 p-2 rounded overflow-x-auto font-mono whitespace-pre-wrap">
                                                        {err.stack}
                                                    </pre>
                                                </div>
                                            )}
                                            {!!err.context && (
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Context</div>
                                                    <pre className="text-[11px] text-gray-400 bg-black/40 p-2 rounded overflow-x-auto font-mono">
                                                        {JSON.stringify(err.context, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-800 bg-gray-950 flex justify-between items-center whitespace-nowrap overflow-hidden">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isDebugMode}
                                onChange={toggleDebugMode}
                                className="w-3 h-3 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[11px] text-gray-400 group-hover:text-gray-200">Debug Mode Active</span>
                        </label>
                        <span className="text-[10px] text-gray-600 font-mono">v1.0.0-debug</span>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
            `}</style>
        </div>
    );
}
