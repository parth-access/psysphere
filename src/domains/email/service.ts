import nodemailer from "nodemailer";
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
 * SMTP Transport
 * ============================================================ */

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error(
      "❌ [EmailService] SMTP configuration is missing. Email delivery is disabled."
    );

    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

/* ============================================================
 * Email Service
 * ============================================================ */

export class EmailService {
  /**
   * General-purpose HTML email sender.
   *
   * All PsySphere transactional emails ultimately pass through
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
    const smtp = getTransporter();

    const type = options?.type || "unknown";
    const relatedEntityType = options?.relatedEntityType || null;
    const relatedEntityId = options?.relatedEntityId || null;

    /* ========================================================
     * SMTP unavailable
     * ======================================================== */

    if (!smtp) {
      console.warn(
        `[EmailService] Unsent - SMTP is not configured. Target: ${to}, Subject: ${subject}`
      );

      try {
        await db.insert(emailDeliveries).values({
          type,
          recipient: to,
          subject,
          provider: "smtp",
          status: "failed",
          errorMessage:
            "Email service is not configured (missing SMTP configuration)",
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
      const result = await smtp.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
        replyTo: EMAIL_DEFAULTS.REPLY_TO,
      });

      console.log(
        `✅ [EmailService] Successfully sent email to ${to} (ID: ${result.messageId})`
      );

      /* ======================================================
       * Log successful delivery
       * ====================================================== */

      try {
        await db.insert(emailDeliveries).values({
          type,
          recipient: to,
          subject,
          provider: "smtp",
          providerMessageId: result.messageId || null,
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
          id: result.messageId,
        },
      };
    } catch (error: unknown) {
      /* ======================================================
       * SMTP failure
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
          provider: "smtp",
          status: "failed",
          errorMessage: errMsg,
          relatedEntityType,
          relatedEntityId,
        });
      } catch (dbErr) {
        console.error(
          "❌ [EmailService] Failed to log SMTP failure:",
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
      "Welcome to PsySphere | Your Demo Class is Confirmed";

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
      "Welcome to PsySphere | Setup Your Account";

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
      "PsySphere | Create Your Password";

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
      "Welcome to PsySphere Core Student Portal";

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
      "Demo Class Request Received | PsySphere";

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
      "psysphereclasses@gmail.com";

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
      ? "Your Live Demo has been Rescheduled! | PsySphere"
      : "Your Live Demo is Scheduled! | PsySphere";

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
      "Demo Request Update | PsySphere";

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
      "Welcome to PsySphere Faculty | Activate Your Account";

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
      "How Was Your PsySphere Demo? Continue Your Journey With Us 💜";

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