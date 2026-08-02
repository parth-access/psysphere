import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles, studentIdCounters } from "@/db/schema/core/studentProfiles";
import { admissionRepository } from "../admissions/repository";
import { createAdminClient } from "../auth/server";
import { emailService } from "../email/service";
import crypto from "crypto";
import { sql, eq, ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "@/db/schema";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

type DBTx = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

/**
 * Concurrency-safe, deterministic helper to generate the next Student ID for the current year.
 * format: PSY-YYYY-NNNN
 */
async function generateStudentId(tx: DBTx): Promise<string> {
  const year = new Date().getFullYear();
  
  // Atomically upsert/increment the counter for the current year
  const [result] = await tx
    .insert(studentIdCounters)
    .values({ year, lastValue: 1 })
    .onConflictDoUpdate({
      target: studentIdCounters.year,
      set: { lastValue: sql`${studentIdCounters.lastValue} + 1` }
    })
    .returning({ lastValue: studentIdCounters.lastValue });

  const nextNum = result?.lastValue ?? 1;
  return `PSY-${year}-${String(nextNum).padStart(4, "0")}`;
}

export class OnboardingService {
  async approveDemo(admissionId: string) {
    // 1. Fetch Admission
    const admission = await admissionRepository.findById(admissionId);
    if (!admission) throw new Error("Admission not found");

    // 2. Validate state & check for idempotency
    // Already DEMO_APPROVED may return idempotently.
    if (admission.status === "DEMO_APPROVED") {
      console.log(`[OnboardingService] Admission ${admissionId} is already DEMO_APPROVED. Returning gracefully.`);
      return { success: true };
    }

    if (admission.status !== "LEAD" && admission.status !== "DEMO_BOOKED") {
      throw new Error(`Cannot approve demo. Current status is ${admission.status}, but must be LEAD or DEMO_BOOKED.`);
    }

    // 3. Update status to DEMO_APPROVED (does NOT create accounts, profiles, student IDs or passwords)
    await admissionRepository.updateStatus(admissionId, "DEMO_APPROVED");

    // 4. Dispatch business notification
    try {
      console.log(`[OnboardingService] Dispatching demo approved email to ${admission.email}`);
      const emailResult = await emailService.sendDemoApproved(admission.email, {
        studentName: admission.studentName,
        email: admission.email,
        demoDate: admission.preferredDate ? `${admission.preferredDate} ${admission.preferredTime ? `at ${admission.preferredTime}` : ""}` : "TBD",
      }, admissionId);
      if (!emailResult.success) {
        console.error(`⚠️ Demo approval email delivery failed: ${emailResult.error}`);
      }
    } catch (emailEx) {
      console.error("[OnboardingService] Error calling email service:", emailEx);
    }

    return { success: true };
  }

  async provisionStudentFromAdmission(admissionId: string) {
    const admission = await admissionRepository.findById(admissionId);
    if (!admission) throw new Error("Admission not found");

    if (admission.status !== "DEMO_COMPLETED" && admission.status !== "ENROLLED") {
      throw new Error(`Cannot convert to student. Status must be DEMO_COMPLETED. Current status: ${admission.status}`);
    }

    // Check if they are already enrolled
    if (admission.status === "ENROLLED") {
      const [existingProfile] = await db.select().from(profiles).where(eq(profiles.email, admission.email));
      if (existingProfile) {
        const [sp] = await db.select().from(studentProfiles).where(eq(studentProfiles.profileId, existingProfile.id));
        return {
          success: true,
          studentId: sp?.admissionNumber || null,
          userId: existingProfile.id,
          alreadyEnrolled: true
        };
      }
    }

    // 1. Setup Supabase Admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase is unconfigured. Cannot securely provision student account.");
    }

    const supabaseAdmin = createAdminClient();

    // 2. Check if Supabase Auth identity already exists for this email (pagination-safe)
    let supabaseUserId = "";
    let isNewUser = true;
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    try {
      while (hasMore) {
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });
        if (listError) {
          throw new Error(`Failed to list users in Supabase Auth: ${listError.message}`);
        }
        const users = listData?.users || [];
        const existingAuthUser = users.find(
          (u) => u.email?.toLowerCase() === admission.email.toLowerCase()
        );
        if (existingAuthUser) {
          supabaseUserId = existingAuthUser.id;
          isNewUser = false;
          console.log(`[OnboardingService] Reusing existing Supabase Auth user: ${supabaseUserId}`);
          break;
        }
        if (users.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    } catch (err: unknown) {
      console.error("[OnboardingService] Auth lookup error:", err);
    }

    // 3. Create Supabase User if not exists (never generate plaintext temporary passwords for the user to read)
    if (!supabaseUserId) {
      const secureRandomPassword = crypto.randomUUID();
      try {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: admission.email,
          email_confirm: true,
          password: secureRandomPassword,
          user_metadata: { role: "student", full_name: admission.studentName }
        });
        if (userError) {
          throw new Error(`Supabase Auth creation failed: ${userError.message}`);
        }
        if (!userData?.user) {
          throw new Error("Supabase Auth returned empty user on student creation.");
        }
        supabaseUserId = userData.user.id;
        isNewUser = true;
        console.log(`[OnboardingService] Created new Supabase Auth user: ${supabaseUserId}`);
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Auth provisioning failed: ${errMsg}`);
      }
    }

    // 4. Create Postgres Records in a transaction
    let studentId = "";
    try {
      await db.transaction(async (tx) => {
        // Find or create Profile
        const [existingProf] = await tx.select().from(profiles).where(eq(profiles.id, supabaseUserId));
        if (!existingProf) {
          await tx.insert(profiles).values({
            id: supabaseUserId,
            role: "student",
            fullName: admission.studentName,
            email: admission.email,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else if (existingProf.role !== "student") {
          await tx.update(profiles)
            .set({ role: "student", updatedAt: new Date() })
            .where(eq(profiles.id, supabaseUserId));
        }

        // Find or create Student Profile
        const [existingStudProf] = await tx.select().from(studentProfiles).where(eq(studentProfiles.profileId, supabaseUserId));
        if (!existingStudProf) {
          studentId = await generateStudentId(tx);
          await tx.insert(studentProfiles).values({
            profileId: supabaseUserId,
            admissionNumber: studentId,
            guardianName: admission.parentName,
            guardianEmail: admission.email,
            guardianPhone: admission.phone,
            enrollmentDate: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          studentId = existingStudProf.admissionNumber || "";
          if (!studentId) {
            studentId = await generateStudentId(tx);
            await tx.update(studentProfiles)
              .set({ admissionNumber: studentId, updatedAt: new Date() })
              .where(eq(studentProfiles.profileId, supabaseUserId));
          }
        }

        // Create enrollment if required data is available (find active batch matching the class level)
        const admissionClassLower = admission.class.toLowerCase();
        const classLevel: "class_11" | "class_12" = admissionClassLower.includes("11") ? "class_11" : "class_12";

        const { batches } = await import("@/db/schema/core/batches");
        const matchingBatches = await tx.select().from(batches).where(eq(batches.classLevel, classLevel));
        const activeBatch = matchingBatches.find(b => b.isActive);

        if (activeBatch) {
          const { enrollments } = await import("@/db/schema/core/enrollments");
          const [existingEnrollment] = await tx.select()
            .from(enrollments)
            .where(eq(enrollments.studentProfileId, supabaseUserId));
          
          if (!existingEnrollment) {
            await tx.insert(enrollments).values({
              studentProfileId: supabaseUserId,
              batchId: activeBatch.id,
              status: "active",
              enrolledAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      });
    } catch (dbError: unknown) {
      const errMsg = dbError instanceof Error ? dbError.message : String(dbError);
      throw new Error(`Database transaction failed: ${errMsg}`);
    }

    // 5. Update Admission Status to ENROLLED
    await admissionRepository.updateStatus(admissionId, "ENROLLED");

    // 6. Generate setup link (invite or recovery)
    let passwordSetupUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password`;
    if (supabaseUserId) {
      try {
        const linkType = isNewUser ? "invite" : "recovery";
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: linkType,
          email: admission.email,
          options: {
            redirectTo: `${process.env.APP_URL || "http://localhost:3000"}/reset-password`
          }
        });

        if (linkError) {
          console.error(`[OnboardingService] Failed to generate ${linkType} link from Supabase:`, linkError);
          // Fallback to recovery if invite fails
          if (linkType === "invite") {
            const { data: recData, error: recError } = await supabaseAdmin.auth.admin.generateLink({
              type: "recovery",
              email: admission.email,
              options: {
                redirectTo: `${process.env.APP_URL || "http://localhost:3000"}/reset-password`
              }
            });
            if (recData?.properties?.action_link) {
              passwordSetupUrl = recData.properties.action_link;
            }
          }
        } else if (linkData?.properties?.action_link) {
          passwordSetupUrl = linkData.properties.action_link;
          console.log(`[OnboardingService] Successfully generated secure Supabase setup link (${linkType}):`, passwordSetupUrl);
        }
      } catch (linkEx) {
        console.error("[OnboardingService] Exception generating secure link from Supabase:", linkEx);
      }
    }

    // 7. Send Account Invitation / Set Your Password link email
    try {
      const emailResult = await emailService.sendStudentInvitation(admission.email, {
        studentName: admission.studentName,
        studentId: studentId,
        email: admission.email,
        passwordSetupUrl,
        teacherName: admission.assignedTeacher || "Dravina Gupta",
        demoDate: admission.demoDate || undefined,
      }, admissionId);
      if (!emailResult.success) {
        console.error(`⚠️ Invitation email delivery failed for ${admission.email}: ${emailResult.error}`);
      }
    } catch (emailErr: unknown) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error(`⚠️ Invitation email exception for ${admission.email}:`, msg);
    }

    return { success: true, studentId, userId: supabaseUserId };
  }
}

export const onboardingService = new OnboardingService();
