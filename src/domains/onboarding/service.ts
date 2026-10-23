import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles, studentIdCounters } from "@/db/schema/core/studentProfiles";
import { enrollments } from "@/db/schema/core/enrollments";
import { createAdminClient } from "../auth/server";
import crypto from "crypto";
import { sql, eq, and, type ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "@/db/schema";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { appUrl } from "../joining/tokens";

type DBTx = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

/** Concurrency-safe student id for the current year: SC-YYYY-NNNN */
async function generateStudentId(tx: DBTx): Promise<string> {
  const year = new Date().getFullYear();
  const [result] = await tx
    .insert(studentIdCounters)
    .values({ year, lastValue: 1 })
    .onConflictDoUpdate({
      target: studentIdCounters.year,
      set: { lastValue: sql`${studentIdCounters.lastValue} + 1` },
    })
    .returning({ lastValue: studentIdCounters.lastValue });
  return `SC-${year}-${String(result?.lastValue ?? 1).padStart(4, "0")}`;
}

export interface ProvisionStudentInput {
  studentName: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  batchId: string;
}

export interface ProvisionStudentResult {
  userId: string;
  studentId: string;
  passwordSetupUrl: string;
}

/** Finds an existing Supabase Auth user by email, paging through users if needed. */
async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const [local] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
  if (local) return local.id;

  const admin = createAdminClient();
  const perPage = 200;
  for (let page = 1; page < 100; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Supabase user lookup failed: ${error.message}`);
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < perPage) break;
  }
  return null;
}

/**
 * Creates (or reuses) the student's login, profile and student profile,
 * and enrolls them in the batch. Safe to call more than once.
 */
export async function provisionStudent(input: ProvisionStudentInput): Promise<ProvisionStudentResult> {
  const email = input.email.trim().toLowerCase();
  const admin = createAdminClient();

  // 1. Login (Supabase Auth)
  let userId = await findAuthUserIdByEmail(email);
  let isNewUser = false;
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID(), // never shown; the student sets their own
      user_metadata: { role: "student", full_name: input.studentName },
    });
    if (error || !data.user) {
      // Lost a race with another request: look again before failing.
      userId = await findAuthUserIdByEmail(email);
      if (!userId) throw new Error(`Could not create login: ${error?.message ?? "unknown error"}`);
    } else {
      userId = data.user.id;
      isNewUser = true;
    }
  }
  const uid = userId;

  // 2. Profile, student profile and enrollment in one transaction
  let studentId = "";
  await db.transaction(async (tx) => {
    const [existingProfile] = await tx.select().from(profiles).where(eq(profiles.id, uid));
    if (!existingProfile) {
      await tx.insert(profiles).values({
        id: uid,
        role: "student",
        fullName: input.studentName,
        email,
        isActive: true,
      });
    } else if (existingProfile.role !== "student") {
      throw new Error(`${email} already belongs to a ${existingProfile.role} account.`);
    }

    const [sp] = await tx.select().from(studentProfiles).where(eq(studentProfiles.profileId, uid));
    if (!sp) {
      studentId = await generateStudentId(tx);
      await tx.insert(studentProfiles).values({
        profileId: uid,
        admissionNumber: studentId,
        guardianName: input.parentName,
        guardianPhone: input.parentPhone,
        guardianEmail: input.parentEmail ?? null,
        notes: `Student phone: ${input.phone}`,
        enrollmentDate: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      });
    } else {
      studentId = sp.admissionNumber || (await generateStudentId(tx));
      await tx
        .update(studentProfiles)
        .set({
          admissionNumber: studentId,
          guardianName: input.parentName,
          guardianPhone: input.parentPhone,
          ...(input.parentEmail ? { guardianEmail: input.parentEmail } : {}),
          updatedAt: new Date(),
        })
        .where(eq(studentProfiles.profileId, uid));
    }

    await tx
      .insert(enrollments)
      .values({ studentProfileId: uid, batchId: input.batchId, status: "active" })
      .onConflictDoNothing({ target: [enrollments.studentProfileId, enrollments.batchId] });

    // Re-activate if they had dropped out of this batch before
    await tx
      .update(enrollments)
      .set({ status: "active", leftAt: null, updatedAt: new Date() })
      .where(and(eq(enrollments.studentProfileId, uid), eq(enrollments.batchId, input.batchId)));
  });

  // 3. Password setup link
  let passwordSetupUrl = appUrl("/sign-in");
  const redirectTo = appUrl("/reset-password");
  for (const type of (isNewUser ? ["invite", "recovery"] : ["recovery"]) as ("invite" | "recovery")[]) {
    const { data, error } = await admin.auth.admin.generateLink({ type, email, options: { redirectTo } });
    if (!error && data?.properties?.action_link) {
      passwordSetupUrl = data.properties.action_link;
      break;
    }
    console.error(`[onboarding] ${type} link failed for ${email}:`, error?.message);
  }

  return { userId: uid, studentId, passwordSetupUrl };
}
