import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { rateLimits } from "@/db/schema/system/rateLimits";

export type Limit = { key: string; max: number; windowMs: number };

/** The caller's IP as Vercel reports it. Falls back to "unknown", which then shares one bucket. */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** How long until the first of these limits allows another try; 0 when none is hit. */
export async function blockedFor(limits: Limit[], now = new Date()): Promise<number> {
  let wait = 0;
  for (const l of limits) {
    const [row] = await db.select().from(rateLimits).where(eq(rateLimits.key, l.key));
    if (!row) continue;
    const endsAt = row.windowStartedAt.getTime() + l.windowMs;
    if (row.count >= l.max && endsAt > now.getTime()) wait = Math.max(wait, endsAt - now.getTime());
  }
  return wait;
}

/** Counts one attempt against each limit. A window that has run out starts again at 1. */
export async function hit(limits: Limit[]) {
  for (const l of limits) {
    const expired = sql`${rateLimits.windowStartedAt} < now() - (${l.windowMs} * interval '1 millisecond')`;
    await db
      .insert(rateLimits)
      .values({ key: l.key, count: 1 })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
          windowStartedAt: sql`case when ${expired} then now() else ${rateLimits.windowStartedAt} end`,
        },
      });
  }
}

export async function clear(key: string) {
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
}

/** "about 12 minutes" style wording for a wait in milliseconds. */
export function waitText(ms: number) {
  const min = Math.ceil(ms / 60_000);
  return min <= 1 ? "a minute" : `${min} minutes`;
}

/**
 * For public forms: up to `perEmail` sends an hour for one email address (so nobody can flood someone's inbox
 * through us) and `perIp` from one network (kept generous, as mobile networks share addresses).
 * Counts this send and returns null when it may go ahead, or a message to show when it may not.
 */
export async function formAllowed(form: string, email: string, { perEmail, perIp }: { perEmail: number; perIp: number }) {
  const limits: Limit[] = [
    { key: `${form}:email:${email.toLowerCase()}`, max: perEmail, windowMs: 60 * 60_000 },
    { key: `${form}:ip:${await clientIp()}`, max: perIp, windowMs: 60 * 60_000 },
  ];
  const wait = await blockedFor(limits);
  if (wait > 0) return `We've had a lot of these from you just now. Please try again in ${waitText(wait)}, or message us on WhatsApp.`;
  await hit(limits);
  return null;
}
