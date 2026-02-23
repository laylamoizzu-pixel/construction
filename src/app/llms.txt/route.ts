import { getSiteConfig } from "@/app/actions/site-config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure it's always up to date with the config

export async function GET() {
    try {
        const config = await getSiteConfig();
        const content = config.llm?.llmsTxtContent || "# LLM Context\nNo specific context provided.";

        // llms.txt is a plain text file format for LLM context inclusion
        return new NextResponse(content, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("Failed to generate llms.txt", error);
        return new NextResponse("# LLM Context Error", { status: 500 });
    }
}
