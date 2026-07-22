import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { admissionRepository } from "../admissions/repository";
import { createClerkClient } from "@clerk/nextjs/server";
import { count } from "drizzle-orm";

const getClerkClient = () => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn("CLERK_SECRET_KEY is missing. Falling back to local mock onboarding mode.");
    return null;
  }
  return createClerkClient({ secretKey });
};

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
    let clerkUserId = `mock_user_${Math.random().toString(36).substring(7)}`;

    // 3. Create Clerk User
    const clerk = getClerkClient();
    if (clerk) {
      try {
        const clerkUser = await clerk.users.createUser({
          emailAddress: [admission.email],
          firstName: admission.studentName.split(' ')[0] || admission.studentName,
          lastName: admission.studentName.split(' ').slice(1).join(' ') || "",
          password: tempPassword,
          publicMetadata: { role: 'student' }
        });
        clerkUserId = clerkUser.id;
        console.log(`Successfully created Clerk user: ${clerkUserId}`);
      } catch (error) {
        console.error("Clerk user creation failed, using mock ID:", error);
      }
    }

    // 4. Create Student Profile and core Profile
    const [newProfile] = await db.insert(profiles).values({
      clerkId: clerkUserId,
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

    // 5. Send Email Notification (Mock or console logs)
    console.log(`[Email Welcome Notification] To: ${admission.email}`);
    console.log(`Welcome to PsySphere! Your student account is ready.`);
    console.log(`Username/Email: ${admission.email}`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log(`Student ID: ${studentId}`);

    // 6. Update Admission Status to DEMO_APPROVED
    await admissionRepository.updateStatus(admissionId, "DEMO_APPROVED");

    return { success: true, studentId, tempPassword, clerkUserId };
  }
}

export const onboardingService = new OnboardingService();

