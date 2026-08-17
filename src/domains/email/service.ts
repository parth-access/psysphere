import { Resend } from "resend";
import { EMAIL_DEFAULTS } from "./constants";
import { db } from "@/db";
import { emailDeliveries } from "@/db/schema";

import {
  SendEmailResponse,
  DemoApprovedPayload,
  StudentInvitationPayload,
  PasswordSetupPayload,
  WelcomeStudentPayload,
  DemoRequestReceivedPayload,
  NewLeadInternalPayload,
  DemoScheduledPayload,
  DemoRejectedPayload,
  TeacherActivationPayload,
  PostDemoConversionPayload,
} from "./types";

import {
  getDemoApprovedTemplate,
  getStudentInvitationTemplate,
  getPasswordSetupTemplate,
  getWelcomeStudentTemplate,
  getDemoRequestReceivedTemplate,
  getNewLeadInternalTemplate,
  getDemoScheduledTemplate,
  getDemoRejectedTemplate,
  getTeacherActivationTemplate,
  getPostDemoConversionTemplate,
} from "./templates";

/* ============================================================
 * Resend Client
 * ============================================================ */

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error(
      "❌ [EmailService] RESEND_API_KEY is missing. Email delivery is disabled."
    );
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

/* ============================================================
 * Email Service
 * ============================================================ */

export class EmailService {
  /**
   * General-purpose HTML email sender.
   *
   * All Saarthi Classes transactional emails ultimately pass through
   * this method.
   *
   * Delivery attempts are logged to email_deliveries.
   */
  async sendHtmlEmail(
    to: string,
    subject: string,
    htmlContent: string,
    from: string = EMAIL_DEFAULTS.FROM,
    options?: {
      type: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
    }
  ): Promise<SendEmailResponse> {
    const resend = getResendClient();

    const type = options?.type || "unknown";
    const relatedEntityType = options?.relatedEntityType || null;
    const relatedEntityId = options?.relatedEntityId || null;

    /* ========================================================
     * Resend unavailable
     * ======================================================== */

    if (!resend) {
      console.warn(
        `[EmailService] Unsent - Resend API key is not configured. Target: ${to}, Subject: ${subject}`
      );

      try {
        await db.insert(emailDeliveries).values({
          type,
          recipient: to,
          subject,
          provider: "resend",
          status: "failed",
          errorMessage:
            "Email service is not configured (missing RESEND_API_KEY)",
          relatedEntityType,
          relatedEntityId,
        });
      } catch (dbErr) {
        console.error(
          "❌ [EmailService] Failed to log unsent email delivery:",
          dbErr
        );
      }

      return {
        success: false,
        error: "Email service is not configured",
      };
    }

    /* ========================================================
     * Send email
     * ======================================================== */

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject,
        html: htmlContent,
        replyTo: EMAIL_DEFAULTS.REPLY_TO,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(
        `✅ [EmailService] Successfully sent email to ${to} (ID: ${data?.id})`
      );

      /* ======================================================
       * Log successful delivery
       * ====================================================== */

      try {
        await db.insert(emailDeliveries).values({
          type,
          recipient: to,
          subject,
          provider: "resend",
          providerMessageId: data?.id || null,
          status: "success",
          relatedEntityType,
          relatedEntityId,
        });
      } catch (dbErr) {
        console.error(
          "❌ [EmailService] Email sent, but successful delivery logging failed:",
          dbErr
        );
      }

      return {
        success: true,
        data: {
          id: data?.id || "unknown",
        },
      };
    } catch (error: unknown) {
      /* ======================================================
       * Resend failure
       * ====================================================== */

      const errMsg =
        error instanceof Error ? error.message : String(error);

      console.error(
        `❌ [EmailService] Failed to send email to ${to}:`,
        error
      );

      try {
        await db.insert(emailDeliveries).values({
          type,
          recipient: to,
          subject,
          provider: "resend",
          status: "failed",
          errorMessage: errMsg,
          relatedEntityType,
          relatedEntityId,
        });
      } catch (dbErr) {
        console.error(
          "❌ [EmailService] Failed to log Resend failure:",
          dbErr
        );
      }

      return {
        success: false,
        error: errMsg,
      };
    }
  }

  /* ============================================================
   * Demo Approved
   * ============================================================ */

  async sendDemoApproved(
    to: string,
    payload: DemoApprovedPayload,
    admissionId?: string
  ): Promise<SendEmailResponse> {
    const html = getDemoApprovedTemplate(payload);

    const subject =
      "Welcome to Saarthi Classes | Your Demo Class is Confirmed";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "demo_approved",
        relatedEntityType: "admission",
        relatedEntityId: admissionId,
      }
    );
  }

  /* ============================================================
   * Student Invitation
   * ============================================================ */

  async sendStudentInvitation(
    to: string,
    payload: StudentInvitationPayload,
    admissionId?: string
  ): Promise<SendEmailResponse> {
    const html = getStudentInvitationTemplate(payload);

    const subject =
      "Welcome to Saarthi Classes | Setup Your Account";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "student_invitation",
        relatedEntityType: "admission",
        relatedEntityId: admissionId,
      }
    );
  }

  /* ============================================================
   * Password Setup
   * ============================================================ */

  async sendPasswordSetup(
    to: string,
    payload: PasswordSetupPayload,
    userId?: string
  ): Promise<SendEmailResponse> {
    const html = getPasswordSetupTemplate(payload);

    const subject =
      "Saarthi Classes | Create Your Password";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "password_setup",
        relatedEntityType: "profile",
        relatedEntityId: userId,
      }
    );
  }

  /* ============================================================
   * Welcome Student
   * ============================================================ */

  async sendWelcomeStudent(
    to: string,
    payload: WelcomeStudentPayload,
    userId?: string
  ): Promise<SendEmailResponse> {
    const html = getWelcomeStudentTemplate(payload);

    const subject =
      "Welcome to Saarthi Classes Core Student Portal";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "welcome_student",
        relatedEntityType: "profile",
        relatedEntityId: userId,
      }
    );
  }

  /* ============================================================
   * Demo Request Received
   * ============================================================ */

  async sendDemoRequestReceived(
    to: string,
    payload: DemoRequestReceivedPayload,
    admissionId?: string
  ): Promise<SendEmailResponse> {
    const html = getDemoRequestReceivedTemplate(payload);

    const subject =
      "Demo Class Request Received | Saarthi Classes";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "demo_request_received",
        relatedEntityType: "admission",
        relatedEntityId: admissionId,
      }
    );
  }

  /* ============================================================
   * New Lead Internal Notification
   * ============================================================ */

  async sendNewLeadInternal(
    payload: NewLeadInternalPayload
  ): Promise<SendEmailResponse> {
    const html = getNewLeadInternalTemplate(payload);

    const subject =
      `[NEW LEAD] Demo Request - ${payload.studentName}`;

    const adminEmail =
      process.env.EMAIL_REPLY_TO ||
      "hello@classes.saarthilife.com";

    return this.sendHtmlEmail(
      adminEmail,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "new_lead_internal",
        relatedEntityType: "admission",
        relatedEntityId: payload.admissionId,
      }
    );
  }

  /* ============================================================
   * Demo Scheduled / Rescheduled
   * ============================================================ */

  async sendDemoScheduled(
    to: string,
    payload: DemoScheduledPayload,
    isRescheduled?: boolean,
    admissionId?: string
  ): Promise<SendEmailResponse> {
    const html = getDemoScheduledTemplate(
      payload,
      isRescheduled
    );

    const subject = isRescheduled
      ? "Your Live Demo has been Rescheduled! | Saarthi Classes"
      : "Your Live Demo is Scheduled! | Saarthi Classes";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: isRescheduled
          ? "demo_rescheduled"
          : "demo_scheduled",
        relatedEntityType: "admission",
        relatedEntityId: admissionId,
      }
    );
  }

  /* ============================================================
   * Demo Rejected / Cancelled
   * ============================================================ */

  async sendDemoRejected(
    to: string,
    payload: DemoRejectedPayload,
    admissionId?: string
  ): Promise<SendEmailResponse> {
    const html = getDemoRejectedTemplate(payload);

    const subject =
      "Demo Request Update | Saarthi Classes";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "demo_rejected",
        relatedEntityType: "admission",
        relatedEntityId: admissionId,
      }
    );
  }

  /* ============================================================
   * Teacher Activation
   * ============================================================ */

  async sendTeacherActivation(
    to: string,
    payload: TeacherActivationPayload,
    teacherId?: string
  ): Promise<SendEmailResponse> {
    const html = getTeacherActivationTemplate(payload);

    const subject =
      "Welcome to Saarthi Classes Faculty | Activate Your Account";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "teacher_activation",
        relatedEntityType: "profile",
        relatedEntityId: teacherId,
      }
    );
  }

  /* ============================================================
   * Post-Demo Conversion
   * ============================================================ */

  async sendPostDemoConversion(
    to: string,
    payload: PostDemoConversionPayload,
    admissionId?: string
  ): Promise<SendEmailResponse> {
    const html = getPostDemoConversionTemplate(payload);

    const subject =
      "How Was Your Saarthi Classes Demo? Continue Your Journey With Us 💜";

    return this.sendHtmlEmail(
      to,
      subject,
      html,
      EMAIL_DEFAULTS.FROM,
      {
        type: "post_demo_conversion",
        relatedEntityType: "admission",
        relatedEntityId: admissionId,
      }
    );
  }
}

/* ============================================================
 * Singleton
 * ============================================================ */

export const emailService = new EmailService();