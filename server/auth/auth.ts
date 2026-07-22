import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Returns the authentication object from Clerk.
 * Useful for accessing userId, sessionId, etc. in Server Actions or Route Handlers.
 */
export const getAuth = auth;

/**
 * Ensures the user is authenticated, redirects if not.
 */
export const requireAuth = async () => {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }
  return session;
};
