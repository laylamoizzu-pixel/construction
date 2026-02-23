"use server";

import prisma from "@/lib/db";

export interface Subscriber {
    id: string;
    email: string;
    subscribedAt: Date;
    status: "subscribed" | "unsubscribed";
}

export async function subscribeToNewsletter(email: string) {
    try {
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existing) {
            return { success: false, error: "Email already subscribed" };
        }

        await prisma.newsletterSubscriber.create({
            data: {
                email,
                status: "subscribed",
            }
        });

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function getNewsletterSubscribers(): Promise<Subscriber[]> {
    try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { subscribedAt: "desc" }
        });
        return subscribers as unknown as Subscriber[];
    } catch (error) {
        console.error("Error fetching newsletter subscribers from Postgres:", error);
        return [];
    }
}

export async function deleteSubscriber(id: string) {
    try {
        await prisma.newsletterSubscriber.delete({
            where: { id }
        });
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
