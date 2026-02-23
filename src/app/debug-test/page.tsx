"use client";

import React from "react";
import { useDebug } from "@/context/DebugContext";

export default function DebugTestPage() {
    const { addError, isDebugMode, toggleDebugMode } = useDebug();

    const triggerManualError = () => {
        addError({
            message: "This is a simulated technical error for testing the inspector.",
            stack: new Error().stack,
            context: {
                component: "DebugTestPage",
                action: "triggerManualError",
                details: "User clicked the test button"
            }
        });
    };

    const triggerCrash = () => {
        // This will be caught by the ErrorBoundary
        throw new Error("BOOM! This is a client-side crash caught by ErrorBoundary.");
    };

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Error Inspector Test Page</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Debug Mode State</h2>
                    <p className="text-gray-600 mb-4">
                        Current State: <span className={isDebugMode ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                            {isDebugMode ? "ACTIVE" : "INACTIVE"}
                        </span>
                    </p>
                    <button
                        onClick={toggleDebugMode}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Toggle Debug Mode
                    </button>
                </div>

                <hr />

                <div>
                    <h2 className="text-lg font-semibold mb-2">Simulate Errors</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={triggerManualError}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                        >
                            Log Manual Error
                        </button>
                        <button
                            onClick={triggerCrash}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Trigger Crash (Caught by Boundary)
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Check the bottom right corner after clicking these buttons.
                    </p>
                </div>
            </div>
        </div>
    );
}
