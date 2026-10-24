import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { clear } from "@/server/security/rateLimit";
import { identifyGoogleUser } from "@/server/integrations/google";
import { createAdminClient, createClient } from "./server";

export type GoogleLoginResult = { ok: true } | { ok: false; reason: "not_linked" | "inactive" | "failed" };

/**
 * Logs in whoever owns the linked Google account behind this sign-in code. Google accounts nobody has linked
 * on their Profile are turned away, so this never creates accounts.
 */
export async function signInWithGoogle(code: string): Promise<GoogleLoginResult> {
  let googleId: string;
  try {
    googleId = (await identifyGoogleUser(code)).id;
  } catch (err) {
    console.error("[google login] could not identify account", err);
    return { ok: false, reason: "failed" };
  }
  const [p] = await db
    .select({ email: profiles.email, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.googleUserId, googleId))
    .limit(1);
  if (!p) return { ok: false, reason: "not_linked" };
  if (!p.isActive) return { ok: false, reason: "inactive" };
  return (await startSession(p.email)) ? { ok: true } : { ok: false, reason: "failed" };
}

/**
 * Gives this browser a normal Supabase session for the account, the same as a password login:
 * a one-time sign-in token is made on the server and redeemed straight away (no email is sent).
 */
async function startSession(email: string) {
  const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    console.error("[google login] could not make a sign-in token", error);
    return false;
  }
  const { error: verifyError } = await (await createClient()).auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
  if (verifyError) {
    console.error("[google login] could not start the session", verifyError);
    return false;
  }
  await clear(`login:email:${email.toLowerCase()}`);
  return true;
}
