import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500,
});

export async function DELETE(req: Request) {
    try {
        await limiter.check(5, "CACHE_TOKEN"); // 5 requests per minute
    } catch {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delete user (Cascade delete will handle related Analysis records if configured, 
        // but our schema has onDelete: Cascade for Analysis->User relation, so it should work)
        await prisma.user.delete({
            where: { email: session.user.email },
        });

        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error: any) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
