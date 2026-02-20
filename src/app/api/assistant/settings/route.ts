/**
 * Public AI Settings API Endpoint
 * 
 * GET /api/assistant/settings
 * 
 * Returns public-facing AI settings for the frontend chat widget.
 */

import { NextResponse } from "next/server";
import { getPublicAISettings } from "@/app/actions/ai-settings-actions";

export async function GET() {
    try {
        const settings = await getPublicAISettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error("[API /assistant/settings] Error:", error);
        return NextResponse.json(
            {
                enabled: true,
                personaName: "Genie",
                greeting: "Hi, I'm Genie, your personal Shopping Master! 🧞‍♂️ How can I help you today?",
                enableVoiceInput: false,
                enableProductRequests: true,
            },
            { status: 200 }
        );
    }
}
