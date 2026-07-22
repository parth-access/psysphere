import { createClient } from "@/src/domains/auth/server";
import { redirect } from "next/navigation";

/**
 * Returns the authentication object from Supabase.
 * Useful for accessing userId, sessionId, etc. in Server Actions or Route Handlers.
 */
export const getAuth = async () => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return {
    userId: session?.user?.id || null,
    session,
  };
};

/**
 * Ensures the user is authenticated, redirects if not.
 */
export const requireAuth = async () => {
  const { userId, session } = await getAuth();
  if (!userId) {
    redirect("/sign-in");
  }
  return { userId, session };
};
