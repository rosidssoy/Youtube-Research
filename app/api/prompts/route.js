import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPromptsByCategory } from "@/lib/notion";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
    try {
        // Check authentication
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch prompts from Notion
        const promptsByCategory = await getPromptsByCategory();

        return NextResponse.json(promptsByCategory);
    } catch (error) {
        console.error("Error fetching prompts:", error);
        return NextResponse.json({
            error: error.message || "Failed to fetch prompts"
        }, { status: 500 });
    }
}
