import crypto from "crypto";
import { and, desc, eq, gt, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { emailChanges } from "@/db/schema/core/emailChanges";
import { createAdminClient } from "../auth/server";
import { emailService } from "../email/service";
import { appUrl, hashToken } from "../joining/tokens";

const DAY = 24 * 60 * 60 * 1000;

/** True when another account already logs in with this email. */
export async function emailTaken(email: string, exceptProfileId: string) {
  const [row] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.email, email), ne(profiles.id, exceptProfileId)))
    .limit(1);
  return !!row;
}

/** Replaces any earlier request and emails a confirmation link to the new address. */
export async function requestEmailChange(me: { id: string; fullName: string }, newEmail: string) {
  const raw = crypto.randomBytes(32).toString("hex");
  await db.delete(emailChanges).where(and(eq(emailChanges.profileId, me.id), isNull(emailChanges.usedAt)));
  await db.insert(emailChanges).values({
    profileId: me.id,
    newEmail,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + DAY),
  });
  return emailService.sendEmailChangeConfirm(
    newEmail,
    { name: me.fullName, newEmail, confirmUrl: appUrl(`/confirm-email?token=${raw}`) },
    me.id
  );
}

export async function pendingEmailChange(profileId: string) {
  const [row] = await db
    .select()
    .from(emailChanges)
    .where(and(eq(emailChanges.profileId, profileId), isNull(emailChanges.usedAt), gt(emailChanges.expiresAt, new Date())))
    .orderBy(desc(emailChanges.createdAt))
    .limit(1);
  return row ?? null;
}

export async function cancelEmailChange(profileId: string) {
  await db.delete(emailChanges).where(and(eq(emailChanges.profileId, profileId), isNull(emailChanges.usedAt)));
}

/** The open request behind a link, with the account it belongs to, or null if the link is unknown, used or expired. */
export async function findEmailChange(rawToken: string) {
  if (!/^[0-9a-f]{64}$/.test(rawToken)) return null;
  const [row] = await db
    .select({ change: emailChanges, name: profiles.fullName, oldEmail: profiles.email })
    .from(emailChanges)
    .innerJoin(profiles, eq(profiles.id, emailChanges.profileId))
    .where(and(eq(emailChanges.tokenHash, hashToken(rawToken)), isNull(emailChanges.usedAt), gt(emailChanges.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

/**
 * Moves the account's login to the new email: Supabase auth first, then our profile row.
 * The request is claimed before anything changes, so a link can't be used twice; it is released again if the move fails.
 */
export async function confirmEmailChange(rawToken: string): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const found = await findEmailChange(rawToken);
  if (!found) return { ok: false, error: "This link has expired or has already been used." };
  const { change, name, oldEmail } = found;

  if (await emailTaken(change.newEmail, change.profileId)) {
    return { ok: false, error: `${change.newEmail} is already used by another account.` };
  }

  const [claimed] = await db
    .update(emailChanges)
    .set({ usedAt: new Date() })
    .where(and(eq(emailChanges.id, change.id), isNull(emailChanges.usedAt)))
    .returning({ id: emailChanges.id });
  if (!claimed) return { ok: false, error: "This link has already been used." };

  const { error } = await createAdminClient().auth.admin.updateUserById(change.profileId, {
    email: change.newEmail,
    email_confirm: true,
  });
  if (error) {
    console.error("[email change] auth update failed:", error);
    await db.update(emailChanges).set({ usedAt: null }).where(eq(emailChanges.id, change.id));
    return {
      ok: false,
      error: /already|exists|registered/i.test(error.message)
        ? `${change.newEmail} is already used by another account.`
        : "We couldn't change your email just now. Try the link again in a minute.",
    };
  }

  await db.update(profiles).set({ email: change.newEmail, updatedAt: new Date() }).where(eq(profiles.id, change.profileId));
  await cancelEmailChange(change.profileId);
  const notice = await emailService.sendEmailChangedNotice(oldEmail, { name, newEmail: change.newEmail }, change.profileId);
  if (!notice.success) console.error("[email change] notice to old address failed:", notice.error);
  return { ok: true, email: change.newEmail };
}
