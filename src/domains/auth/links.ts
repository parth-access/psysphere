import { createAdminClient } from "./server";
import { appUrl } from "../joining/tokens";

/**
 * A one-time link to /reset-password on our own domain, for setting or resetting a password.
 * Supabase only mints the token; the link never goes through Supabase's redirect, so its
 * "Site URL" setting can't send people to the wrong place. Null if no link could be made
 * (for "recovery", that includes the email having no account).
 */
export async function passwordLink(email: string, type: "recovery" | "invite"): Promise<string | null> {
  const { data, error } = await createAdminClient().auth.admin.generateLink({ type, email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    if (error) console.error(`[auth] ${type} link failed for ${email}:`, error.message);
    return null;
  }
  return appUrl(`/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=${type}`);
}
