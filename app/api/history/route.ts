import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500,
});

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        const where: any = { userId: session.user.id };
        if (type) {
            where.type = type;
        }

        const analyses = await prisma.analysis.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ data: analyses });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await limiter.check(20, "CACHE_TOKEN"); // 20 requests per minute
    } catch {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type, title, thumbnail, data } = await req.json();

        if (!type || !title || !data) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const analysis = await prisma.analysis.create({
            data: {
                userId: session.user.id,
                type,
                title,
                thumbnail: thumbnail || "",
                data: JSON.stringify(data),
            },
        });

        return NextResponse.json({ data: analysis });
    } catch (error: any) {
        console.error("History API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
