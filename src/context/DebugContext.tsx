"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AppError {
    id: string;
    message: string;
    stack?: string;
    timestamp: number;
    digest?: string;
    context?: unknown;
}

interface DebugContextType {
    errors: AppError[];
    addError: (error: Omit<AppError, "id" | "timestamp">) => void;
    clearErrors: () => void;
    isDebugMode: boolean;
    toggleDebugMode: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
    const [errors, setErrors] = useState<AppError[]>([]);
    const [isDebugMode, setIsDebugMode] = useState(false);

    const addError = useCallback((error: Omit<AppError, "id" | "timestamp">) => {
        const newError: AppError = {
            ...error,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
        };
        setErrors((prev) => [newError, ...prev].slice(0, 50)); // Keep last 50 errors

        // Auto-enable debug mode if an error occurs and we're in development
        if (process.env.NODE_ENV === "development") {
            setIsDebugMode(true);
        }
    }, []);

    const clearErrors = useCallback(() => setErrors([]), []);
    const toggleDebugMode = useCallback(() => setIsDebugMode((prev) => !prev), []);

    return (
        <DebugContext.Provider value={{ errors, addError, clearErrors, isDebugMode, toggleDebugMode }}>
            {children}
        </DebugContext.Provider>
    );
}

export function useDebug() {
    const context = useContext(DebugContext);
    if (context === undefined) {
        throw new Error("useDebug must be used within a DebugProvider");
    }
    return context;
}
