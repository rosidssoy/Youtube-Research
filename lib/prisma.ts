import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma_v3: PrismaClient };

export const prisma =
    globalForPrisma.prisma_v3 ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;
