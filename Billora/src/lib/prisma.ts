import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolves and sanitizes the database connection URL from environment variables.
 * Checks DATABASE_URL, POSTGRES_URL, and DIRECT_URL, trimming any accidental quotes.
 */
function getDatabaseUrl(): string | undefined {
  const rawUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_URL;

  if (!rawUrl) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[Prisma Error] DATABASE_URL is not set in the production environment. " +
          "Ensure DATABASE_URL is added to your Render dashboard under Environment."
      );
    }
    return undefined;
  }

  // Remove surrounding quotes if accidentally included in deployment dashboard
  return rawUrl.replace(/^["']|["']$/g, "").trim();
}

const datasourceUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
