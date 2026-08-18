"use server";
import crypto from "crypto";

import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/src/domains/auth/server";
import { emailService } from "@/src/domains/email/service";
import { requireRole } from "@/server/authorization/requireRole";
import { z } from "zod";
import { eq } from "drizzle-orm";

const createTeacherSchema = z.object({
  fullName: z.string().min(1, "Teacher Full Name is required").max(100, "Full Name too long"),
  email: z.string().email("Invalid email format"),
});

export async function createTeacherAction(formData: FormData) {
  // Ensure only authorized admins can create teacher profiles
  await requireRole(["admin"]);

  const rawFullName = formData.get("fullName") as string;
  const rawEmail = formData.get("email") as string;

  const validated = createTeacherSchema.parse({
    fullName: rawFullName,
    email: rawEmail,
  });

  const email = validated.email.toLowerCase();

  // 1. Detect duplicate emails in local database first
  const [existingDbProfile] = await db.select().from(profiles).where(eq(profiles.email, email));
  if (existingDbProfile) {
    throw new Error(`A faculty or user profile with email '${email}' already exists in the database.`);
  }

  // 2. Setup Supabase Admin and check for duplicate in Auth identity source of truth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase is unconfigured. Cannot securely create teacher accounts.");
  }

  const supabaseAdmin = createAdminClient();

  let existingAuthUser = false;
  try {
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.warn(`[createTeacherAction] Auth lookup warning: ${listError.message}`);
    } else {
      const found = listData?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );
      if (found) {
        existingAuthUser = true;
      }
    }
  } catch (lookupErr: unknown) {
    const msg = lookupErr instanceof Error ? lookupErr.message : String(lookupErr);
    console.warn(`[createTeacherAction] Auth lookup warning: ${msg}`);
  }

  if (existingAuthUser) {
    throw new Error(`An authentication account with email '${email}' already exists in Supabase Auth.`);
  }

  // 3. Create the User in Supabase Auth using the Admin client
  let supabaseUserId = "";
  const securePassword = crypto.randomUUID();

  try {
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      password: securePassword,
      user_metadata: { role: "teacher", full_name: validated.fullName }
    });

    if (userError) {
      console.error("Supabase Admin user creation failed:", userError);
      throw new Error(`Supabase Auth creation failed: ${userError.message}`);
    }

    if (!userData?.user) {
      throw new Error("Supabase Auth returned an empty user object.");
    }

    supabaseUserId = userData.user.id;
    console.log(`Successfully created Supabase Auth user for teacher: ${supabaseUserId}`);
  } catch (error: any) {
    console.error("Teacher authentication setup exception:", error);
    throw new Error(error.message || "Failed to provision authentication account for teacher.");
  }

  // 4. Insert Teacher Profile into our local DB with transaction safety
  try {
    await db.insert(profiles).values({
      id: supabaseUserId,
      fullName: validated.fullName,
      email: email,
      role: "teacher",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (dbError: any) {
    console.error("Failed to insert teacher profile into local PostgreSQL:", dbError);
    // Rollback: Delete created user from Supabase if DB insert fails to keep them in sync
    try {
      await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
      console.log(`Cleaned up Supabase Auth user ${supabaseUserId} after local DB insertion failure.`);
    } catch (cleanupError) {
      console.error("Failed to clean up Supabase user after DB failure:", cleanupError);
    }
    throw new Error(`Database persistence failed: ${dbError.message || dbError}`);
  }

  // 5. Generate secure invitation / password setup link from Supabase
  let passwordSetupUrl = "";
  try {
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${process.env.APP_URL || "http://localhost:3000"}/reset-password`
      }
    });

    if (linkError) {
      console.error("Failed to generate secure teacher recovery link from Supabase:", linkError);
      throw new Error(`Failed to generate secure password setup link: ${linkError.message}`);
    }

    if (!linkData?.properties?.action_link) {
      throw new Error("Supabase generateLink did not return a valid action link.");
    }

    passwordSetupUrl = linkData.properties.action_link;
    console.log("Successfully generated secure Supabase teacher recovery URL.");
  } catch (error: any) {
    console.error("Exception generating teacher recovery link from Supabase:", error);
    throw new Error(error.message || "Failed to generate secure password setup link.");
  }

  // 6. Send Invite Email via Resend - do not rollback if email fails, return success with warning!
  let emailSent = false;
  let emailErrorMsg = "";
  try {
    const emailResult = await emailService.sendTeacherActivation(email, {
      teacherName: validated.fullName,
      email,
      passwordSetupUrl
    }, supabaseUserId);
    if (emailResult.success) {
      emailSent = true;
      console.log(`Successfully dispatched teacher invitation email to ${email}`);
    } else {
      emailErrorMsg = emailResult.error || "Unknown email error";
      console.error(`Failed to send teacher activation email: ${emailErrorMsg}`);
    }
  } catch (emailError: any) {
    emailErrorMsg = emailError?.message || String(emailError);
    console.error("Failed to send teacher activation email:", emailError);
  }

  revalidatePath("/dashboard/teachers");
  revalidatePath("/dashboard");
}
