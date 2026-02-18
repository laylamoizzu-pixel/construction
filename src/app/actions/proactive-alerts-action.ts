"use server";

import { generateOOSUrgency, generateBackInStockMessage } from "@/lib/llm-service";

export interface OOSUrgencyResult {
    success: boolean;
    data?: {
        headline: string;
        subtext: string;
        urgencyLevel: "high" | "medium" | "low";
    };
    error?: string;
}

export interface RestockSubscriptionResult {
    success: boolean;
    message?: string;
    demoNotification?: {
        subject: string;
        body: string;
        discountCode?: string;
    };
    error?: string;
}

export async function getOOSUrgency(
    productName: string,
    sku: string,
    stockLevel: number
): Promise<OOSUrgencyResult> {
    try {
        // Simulate random view count for social proof (10-50 active viewers)
        const viewCount = Math.floor(Math.random() * (50 - 10 + 1)) + 10;

        const result = await generateOOSUrgency(productName, sku, stockLevel, viewCount);

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error("Error generating OOS urgency:", error);
        return {
            success: false,
            error: "Failed to generate urgency message"
        };
    }
}

export async function subscribeToRestock(
    productName: string,
    email: string
): Promise<RestockSubscriptionResult> {
    try {
        // In a real app, we would save the subscription to DB here.
        console.log(`Subscribed ${email} to ${productName}`);

        // For DEMO purposes: Generate the "future" notification immediately
        // so we can show the user what they WILL get.
        // We'll treat the user as "Valued Customer".
        const notification = await generateBackInStockMessage(productName, "Valued Customer");

        return {
            success: true,
            message: "Subscription successful!",
            demoNotification: notification
        };
    } catch (error) {
        console.error("Error subscribing to restock:", error);
        return {
            success: false,
            error: "Failed to subscribe"
        };
    }
}
