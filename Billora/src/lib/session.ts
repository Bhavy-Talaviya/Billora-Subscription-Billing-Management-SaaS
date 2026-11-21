import { auth } from "@/auth";

/**
 * Retrieves the current authenticated user from Auth.js session.
 */
export async function getSessionUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Retrieves the current authenticated user's ID for tenant isolation.
 * Returns undefined if called outside an active user session.
 */
export async function getSessionUserId(): Promise<string | undefined> {
  const session = await auth();
  return session?.user?.id || undefined;
}
