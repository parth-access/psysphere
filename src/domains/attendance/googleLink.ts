import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { requireRole } from "@/server/authorization/requireRole";
import { identifyGoogleUser } from "@/server/integrations/google";

export type LinkResult = { ok: true } | { ok: false; reason: "auth" | "taken" | "failed" };

/** Saves which Google account the signed-in student joins Meet with. One Google account can belong to one student. */
export async function linkGoogleAccount(code: string): Promise<LinkResult> {
  let me;
  try {
    me = await requireRole(["student"]);
  } catch {
    return { ok: false, reason: "auth" };
  }
  let g;
  try {
    g = await identifyGoogleUser(code);
  } catch (err) {
    console.error("[google link]", err);
    return { ok: false, reason: "failed" };
  }
  const [other] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.googleUserId, g.id), ne(profiles.id, me.id)))
    .limit(1);
  if (other) return { ok: false, reason: "taken" };
  await db.update(profiles).set({ googleUserId: g.id, googleEmail: g.email, updatedAt: new Date() }).where(eq(profiles.id, me.id));
  return { ok: true };
}

export async function unlinkGoogleAccount(profileId: string) {
  await db.update(profiles).set({ googleUserId: null, googleEmail: null, updatedAt: new Date() }).where(eq(profiles.id, profileId));
}
