/**
 * API Health Check Endpoint
 * 
 * GET /api/assistant/health
 * 
 * Returns the health status of the recommendation system,
 * including API key usage and availability.
 * Now syncs keys from the database before returning status.
 */

import { NextResponse } from "next/server";
import { getAPIKeyManager } from "@/lib/api-key-manager";
import { syncAPIKeysToManager } from "@/app/api-key-actions";

export async function GET() {
    try {
        // Sync keys from the database before checking health
        await syncAPIKeysToManager();

        const keyManager = getAPIKeyManager();
        const keyStatus = keyManager.getHealthStatus();

        const response = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            apiKeys: {
                configured: keyStatus.totalKeys,
                activeIndex: keyStatus.activeKeyIndex,
                lastRotation: keyStatus.lastRotation?.toISOString() || null,
                keys: keyStatus.keys.map(k => ({
                    index: k.index,
                    maskedKey: k.maskedKey,
                    callCount: k.callCount,
                    isActive: k.isActive,
                    isHealthy: k.isHealthy,
                    rateLimited: k.rateLimited,
                    cooldownRemaining: k.cooldownRemaining,
                })),
            },
            warnings: [] as string[],
        };

        // Add warnings if needed
        if (keyStatus.totalKeys === 0) {
            response.status = "degraded";
            response.warnings.push("No API keys configured. Add keys via Admin > AI Assistant.");
        } else if (keyStatus.totalKeys === 1) {
            response.warnings.push("Only one API key configured. Consider adding more for redundancy.");
        }

        const healthyKeys = keyStatus.keys.filter(k => k.isHealthy).length;
        if (healthyKeys === 0 && keyStatus.totalKeys > 0) {
            response.status = "degraded";
            response.warnings.push("All API keys are currently in cooldown or rate-limited.");
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("[API /assistant/health] Error:", error);

        return NextResponse.json(
            {
                status: "error",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
