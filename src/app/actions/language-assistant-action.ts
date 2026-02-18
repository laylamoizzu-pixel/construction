"use server";

import { chatWithAssistant } from "@/lib/llm-service";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ChatResponse {
    success: boolean;
    reply?: string;
    suggestedActions?: string[];
    error?: string;
}

export async function sendChatMessage(
    message: string,
    history: ChatMessage[]
): Promise<ChatResponse> {
    try {
        // Limit history to last 10 messages for context window management
        const recentHistory = history.slice(-10);

        const result = await chatWithAssistant(message, recentHistory);

        return {
            success: true,
            reply: result.reply,
            suggestedActions: result.suggestedActions
        };
    } catch (error) {
        console.error("Chat Error:", error);
        return {
            success: false,
            error: "Sorry, I'm having trouble connecting right now. Please try again."
        };
    }
}
