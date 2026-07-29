import { admissionRepository } from "./repository";
import { onboardingService } from "../onboarding/service";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { eq } from "drizzle-orm";
import { emailService } from "../email/service";
import { prospectTokenService } from "./tokens";

export class AdmissionService {
  /**
   * Transition: LEAD / DEMO_BOOKED -> DEMO_APPROVED
   */
  async approveDemo(id: string) {
    const admission = await admissionRepository.findById(id);
    if (!admission) throw new Error("Admission record not found");

    if (admission.status === "DEMO_APPROVED") {
      return { success: true, message: "Demo already approved", admission };
    }

    if (admission.status !== "LEAD" && admission.status !== "DEMO_BOOKED") {
      throw new Error(
        `Invalid transition: Cannot approve demo for admission in '${admission.status}' state. Only LEAD or DEMO_BOOKED can be approved.`
      );
    }

    return await onboardingService.approveDemo(id);
  }

  /**
   * Transition: any active state -> REJECTED
   */
  async reject(id: string) {
    const admission = await admissionRepository.findById(id);
    if (!admission) throw new Error("Admission record not found");

    if (admission.status === "REJECTED") {
      return admission; // Idempotent return
    }

    if (admission.status === "ENROLLED") {
      throw new Error("Invalid transition: Cannot reject an already ENROLLED student.");
    }

    const updated = await admissionRepository.updateStatus(id, "REJECTED");

    try {
      const emailResult = await emailService.sendDemoRejected(admission.email, {
        studentName: admission.studentName
      }, id);
      if (!emailResult.success) {
        console.error(`⚠️ Demo rejection email delivery failed: ${emailResult.error}`);
      }
    } catch (emailErr: unknown) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("⚠️ Failed to send demo rejection email:", msg);
    }

    return updated[0];
  }

  /**
   * Transition: DEMO_APPROVED / DEMO_SCHEDULED -> DEMO_SCHEDULED
   */
  async scheduleDemo(id: string, teacherId: string, demoDate: string, demoTime: string, meetingUrl: string) {
    // 1. Fetch and validate admission record
    const admission = await admissionRepository.findById(id);
    if (!admission) throw new Error("Admission record not found");

    if (admission.status === "LEAD" || admission.status === "DEMO_BOOKED") {
      throw new Error("Invalid transition: Admission must be approved before scheduling a demo.");
    }

    if (admission.status === "ENROLLED" || admission.status === "REJECTED") {
      throw new Error(`Invalid transition: Cannot schedule a demo for a student who is already ${admission.status}.`);
    }

    if (admission.status !== "DEMO_APPROVED" && admission.status !== "DEMO_SCHEDULED") {
      throw new Error(`Invalid transition: Cannot schedule demo from status '${admission.status}'.`);
    }

    // 2. Verify Assigned Teacher (existence, role, activity status)
    const [teacher] = await db.select().from(profiles).where(eq(profiles.id, teacherId));
    if (!teacher) {
      throw new Error(`Assigned faculty member with ID ${teacherId} does not exist in the database.`);
    }
    if (teacher.role !== "teacher") {
      throw new Error(`Assigned faculty member ${teacher.fullName} is not registered as a teacher.`);
    }
    if (!teacher.isActive) {
      throw new Error(`Assigned faculty member ${teacher.fullName} is currently inactive.`);
    }

    const isRescheduled = admission.status === "DEMO_SCHEDULED" || !!admission.demoDate;

    // 3. Persist demo details and update status
    await admissionRepository.updateDemoDetails(id, teacherId, demoDate, demoTime, meetingUrl);
    const updated = await admissionRepository.updateStatus(id, "DEMO_SCHEDULED");

    // 4. Send actual scheduled/rescheduled email with accurate meeting details
    try {
      const emailResult = await emailService.sendDemoScheduled(admission.email, {
        studentName: admission.studentName,
        demoDate: demoDate,
        demoTime: demoTime,
        teacherName: teacher.fullName,
        googleMeetUrl: meetingUrl
      }, isRescheduled, id);
      
      if (!emailResult.success) {
        console.error(`⚠️ Demo scheduled email delivery failed: ${emailResult.error}`);
      }
    } catch (emailErr: unknown) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("⚠️ Failed to send demo schedule email:", msg);
    }

    return updated[0];
  }

  /**
   * Transition: DEMO_SCHEDULED -> DEMO_COMPLETED
   */
  async markDemoCompleted(id: string) {
    const admission = await admissionRepository.findById(id);
    if (!admission) throw new Error("Admission record not found");

    if (admission.status === "DEMO_COMPLETED") {
      return admission; // Idempotent
    }

    if (admission.status !== "DEMO_SCHEDULED") {
      throw new Error(`Invalid transition: Demo can only be marked as completed from DEMO_SCHEDULED status. Current: ${admission.status}`);
    }

    const updated = await admissionRepository.updateStatus(id, "DEMO_COMPLETED");

    // Generate secure prospect experience / join token
    try {
      const rawToken = await prospectTokenService.generateToken(id);
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const previewUrl = `${appUrl}/experience/${rawToken}`;
      const joinUrl = `${appUrl}/join/${rawToken}`;

      const emailResult = await emailService.sendPostDemoConversion(admission.email, {
        studentName: admission.studentName,
        previewUrl,
        joinUrl
      }, id);

      if (!emailResult.success) {
        console.error(`⚠️ Post-demo conversion email delivery failed: ${emailResult.error}`);
      }
    } catch (tokenErr: unknown) {
      const msg = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
      console.error("⚠️ Failed to generate token or send post-demo email:", msg);
    }

    return updated[0];
  }
  
  /**
   * Transition: DEMO_COMPLETED -> ENROLLED
   */
  async convertToStudent(id: string) {
    const admission = await admissionRepository.findById(id);
    if (!admission) throw new Error("Admission record not found");

    if (admission.status === "ENROLLED") {
      // Return existing student idempotently and gracefully
      const [existingProfile] = await db.select().from(profiles).where(eq(profiles.email, admission.email));
      return {
        success: true,
        message: "Student is already enrolled.",
        userId: existingProfile?.id || null,
        studentId: null
      };
    }

    if (admission.status !== "DEMO_COMPLETED") {
      throw new Error(`Invalid transition: Conversion to student is only allowed after a demo class is DEMO_COMPLETED. Current: ${admission.status}`);
    }

    // Call dedicated student provisioning operation rather than approveDemo
    return await onboardingService.provisionStudentFromAdmission(id);
  }
}

export const admissionService = new AdmissionService();
