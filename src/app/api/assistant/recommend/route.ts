/**
 * Product Recommendation API Endpoint
 * 
 * POST /api/assistant/recommend
 * 
 * Accepts natural language queries and returns product recommendations.
 * Syncs API keys from the database before processing.
 */

import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendation-engine";
import { RecommendationRequest } from "@/types/assistant-types";
import { syncAPIKeysToManager } from "@/app/api-key-actions";
import { getAISettings } from "@/app/actions/ai-settings-actions";

export async function POST(request: NextRequest) {
    try {
        // Check if AI is enabled by admin
        const aiSettings = await getAISettings();
        if (!aiSettings.enabled) {
            return NextResponse.json({
                success: true,
                recommendations: [],
                summary: "I'm currently unavailable. Please check back later!",
                processingTime: 0,
            });
        }

        // Sync API keys from the database
        await syncAPIKeysToManager();

        const body = await request.json();

        // Validate request body
        const recommendationRequest: RecommendationRequest = {
            query: body.query,
            context: body.context,
            messages: body.messages,
            maxResults: body.maxResults,
        };

        if (!recommendationRequest.query || typeof recommendationRequest.query !== "string") {
            return NextResponse.json(
                { success: false, error: "Query is required and must be a string" },
                { status: 400 }
            );
        }

        if (recommendationRequest.query.length > 1000) {
            return NextResponse.json(
                { success: false, error: "Query must be less than 1000 characters" },
                { status: 400 }
            );
        }

        // Validate context if provided
        if (recommendationRequest.context) {
            if (recommendationRequest.context.budget !== undefined &&
                (typeof recommendationRequest.context.budget !== "number" || recommendationRequest.context.budget < 0)) {
                return NextResponse.json(
                    { success: false, error: "Budget must be a positive number" },
                    { status: 400 }
                );
            }
        }

        // Get recommendations
        const response = await getRecommendations(recommendationRequest);

        if (!response.success) {
            return NextResponse.json(response, { status: 500 });
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("[API /assistant/recommend] Error:", error);

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { success: false, error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                recommendations: [],
                summary: "",
            },
            { status: 500 }
        );
    }
}

// Optionally support GET for simple queries
export async function GET(request: NextRequest) {
    // Sync API keys from the database
    await syncAPIKeysToManager();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || searchParams.get("query");

    if (!query) {
        return NextResponse.json(
            { success: false, error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    const budget = searchParams.get("budget");
    const category = searchParams.get("category");

    const recommendationRequest: RecommendationRequest = {
        query,
        context: {
            budget: budget ? parseFloat(budget) : undefined,
            categoryId: category || undefined,
        },
        maxResults: 5,
    };

    const response = await getRecommendations(recommendationRequest);

    if (!response.success) {
        return NextResponse.json(response, { status: 500 });
    }

    return NextResponse.json(response);
}
