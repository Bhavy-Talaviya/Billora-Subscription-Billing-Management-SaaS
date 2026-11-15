/**
 * Global Prisma Client instantiation
 * Prevents multiple instances of Prisma Client in development.
 */

// Placeholder for PrismaClient initialization when @prisma/client is installed
export const prisma = (globalThis as unknown as { prisma: unknown }).prisma ?? null;
