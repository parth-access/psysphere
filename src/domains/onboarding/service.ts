import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { admissionRepository } from "../admissions/repository";
import { createAdminClient } from "../auth/server";
import { emailService } from "../email/service";
import { count } from "drizzle-orm";

export class OnboardingService {
  async approveDemo(admissionId: string) {
    // 1. Fetch Admission
    const admission = await admissionRepository.findById(admissionId);
    if (!admission) throw new Error("Admission not found");
    
    // 2. Generate Student ID (PSY-2026-0001 format)
    const year = new Date().getFullYear();
    const studentCountResult = await db.select({ value: count() }).from(studentProfiles);
    const studentNum = (Number(studentCountResult[0]?.value) || 0) + 1;
    const studentId = `PSY-${year}-${String(studentNum).padStart(4, "0")}`;
    
    const tempPassword = `PsySphere@${Math.floor(1000 + Math.random() * 9000)}`;
    let supabaseUserId = `mock_user_${Math.random().toString(36).substring(7)}`;
    let supabaseAdmin: any = null;

    // 3. Create Supabase User
    try {
      supabaseAdmin = createAdminClient();
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: admission.email,
        email_confirm: true,
        password: tempPassword,
        user_metadata: { role: "student", full_name: admission.studentName }
      });
      if (userError) {
        console.error("Supabase user creation failed:", userError);
      } else if (userData?.user) {
        supabaseUserId = userData.user.id;
        console.log(`Successfully created Supabase user: ${supabaseUserId}`);
      }
    } catch (error) {
      console.error("Supabase admin creation connection error, using mock ID:", error);
    }

    // 4. Create Student Profile and core Profile
    const [newProfile] = await db.insert(profiles).values({
      clerkId: supabaseUserId,
      role: "student",
      fullName: admission.studentName,
      email: admission.email,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    await db.insert(studentProfiles).values({
      profileId: newProfile.id,
      admissionNumber: studentId,
      guardianName: admission.parentName,
      guardianEmail: admission.email,
      guardianPhone: admission.phone,
      enrollmentDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Generate Password Setup Link
    let passwordSetupUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password`;
    if (supabaseAdmin && supabaseUserId && !supabaseUserId.startsWith("mock_user_")) {
      try {
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "invite",
          email: admission.email,
          options: {
            redirectTo: `${process.env.APP_URL || "http://localhost:3000"}/reset-password`
          }
        });

        if (linkError) {
          console.error("Failed to generate verification action link from Supabase:", linkError);
        } else if (linkData?.properties?.action_link) {
          passwordSetupUrl = linkData.properties.action_link;
          console.log("Successfully generated secure Supabase invite URL:", passwordSetupUrl);
        }
      } catch (linkError) {
        console.error("Exception generating invitation link from Supabase:", linkError);
      }
    }

    // 6. Send Premium Email Notification via Resend (or Mock fallback)
    try {
      console.log(`[OnboardingService] Dispatching invitation email to ${admission.email}`);
      const emailResult = await emailService.sendStudentInvitation(admission.email, {
        studentName: admission.studentName,
        studentId,
        email: admission.email,
        passwordSetupUrl,
        teacherName: admission.assignedTeacher || "Dr. Aristha Sen",
        demoDate: admission.demoDate || (admission.preferredDate ? `${admission.preferredDate} ${admission.preferredTime ? `at ${admission.preferredTime}` : ""}` : undefined)
      });
      console.log("[OnboardingService] Email sending output:", emailResult);
    } catch (emailEx) {
      console.error("[OnboardingService] Error calling email service:", emailEx);
    }

    // 7. Update Admission Status to DEMO_APPROVED
    await admissionRepository.updateStatus(admissionId, "DEMO_APPROVED");

    return { success: true, studentId, tempPassword, clerkUserId: supabaseUserId };
  }
}

export const onboardingService = new OnboardingService();
