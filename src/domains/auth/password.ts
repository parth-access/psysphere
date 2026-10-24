import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { blockedFor, clear, hit, waitText, type Limit } from "@/server/security/rateLimit";

/**
 * Checks a signed-in person's current password before a sensitive change, without touching their session.
 * Five wrong tries in 15 minutes locks the check for the rest of that window.
 * Returns an error message, or null when the password is right.
 */
export async function checkCurrentPassword(userId: string, email: string, password: string): Promise<string | null> {
  if (!password) return "Enter your current password.";
  const limits: Limit[] = [{ key: `pwcheck:${userId}`, max: 5, windowMs: 15 * 60_000 }];
  const wait = await blockedFor(limits);
  if (wait > 0) return `Too many wrong tries. Try again in ${waitText(wait)}.`;

  const client = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || data.user?.id !== userId) {
    if (error?.code === "over_request_rate_limit") return "Too many attempts right now. Wait a minute and try again.";
    await hit(limits);
    return "Your current password isn't right.";
  }
  // The check made a session of its own; end just that one.
  await client.auth.signOut({ scope: "local" }).catch(() => {});
  await clear(limits[0].key);
  return null;
}
