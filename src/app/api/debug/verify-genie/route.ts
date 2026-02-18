
import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendation-engine";
import { RecommendationRequest } from "@/types/assistant-types";

// Force dynamic needed to prevent static generation errors if any
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const results: any[] = [];
    let passed = 0;
    let failed = 0;

    async function testCase(name: string, query: string, expectedCondition: (result: any) => boolean) {
        const startTime = Date.now();
        try {
            const req: RecommendationRequest = {
                query: query,
                messages: [],
                maxResults: 5
            };

            const result = await getRecommendations(req);
            const duration = Date.now() - startTime;
            const success = expectedCondition(result);

            if (success) passed++;
            else failed++;

            results.push({
                name,
                query,
                status: success ? "PASSED" : "FAILED",
                duration,
                resultSummary: result.summary,
                recommendationCount: result.recommendations?.length || 0,
                fullResult: result // returning full result for debug
            });
        } catch (error) {
            results.push({
                name,
                query,
                status: "ERROR",
                error: String(error)
            });
            failed++;
        }
    }

    // 1. Test Non-existent Product (Hallucination Check)
    await testCase(
        "Non-existent Product (Flying Car)",
        "Do you have a flying car?",
        (res) => res.success && res.recommendations.length === 0
    );

    // 2. Test Nonsense Category
    await testCase(
        "Nonsense Query",
        "Show me unobtainium widgets",
        (res) => res.success && res.recommendations.length === 0
    );

    // 3. Test Product Request Trigger (Rolex)
    await testCase(
        "Valid but Missing Product (Rolex)",
        "I want to buy a Rolex watch",
        (res) => {
            const summaryLower = (res.summary || "").toLowerCase();
            return res.success && res.recommendations.length === 0 &&
                (summaryLower.includes("request") || summaryLower.includes("note down") || summaryLower.includes("don't have"));
        }
    );

    // 4. Test Available Product (General Check)
    await testCase(
        "General Query (Stationery)",
        "Stationery",
        (res) => res.success // Just check it doesn't crash
    );

    return NextResponse.json({
        summary: `Verification Complete: ${passed} Passed, ${failed} Failed`,
        passed,
        failed,
        details: results
    });
}
