import { Resend } from "resend";
import { EMAIL_DEFAULTS } from "./constants";
import { db } from "@/db";
import { emailDeliveries } from "@/db/schema";

import type {
  SendEmailResponse,
  WorkshopRegisteredPayload,
  WorkshopReminderPayload,
  WorkshopJoinInvitePayload,
  JoinRequestReceivedPayload,
  NewJoinRequestInternalPayload,
  JoinRequestApprovedPayload,
  JoinRequestDeclinedPayload,
  EnrollmentConfirmedPayload,
  PasswordSetupPayload,
  PasswordResetPayload,
  TeacherActivationPayload,
  WeeklyReportPayload,
} from "./types";

import {
  getWorkshopRegisteredTemplate,
  getWorkshopReminderTemplate,
  getWorkshopJoinInviteTemplate,
  getJoinRequestReceivedTemplate,
  getNewJoinRequestInternalTemplate,
  getJoinRequestApprovedTemplate,
  getJoinRequestDeclinedTemplate,
  getEnrollmentConfirmedTemplate,
  getPasswordSetupTemplate,
  getPasswordResetTemplate,
  getTeacherActivationTemplate,
  getWeeklyReportTemplate,
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
      replyTo?: string;
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
        replyTo: options?.replyTo || EMAIL_DEFAULTS.REPLY_TO,
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

  private send(
    to: string,
    subject: string,
    html: string,
    type: string,
    relatedEntityType?: string,
    relatedEntityId?: string
  ) {
    return this.sendHtmlEmail(to, subject, html, EMAIL_DEFAULTS.FROM, {
      type,
      relatedEntityType,
      relatedEntityId,
    });
  }

  /* ---------------- Workshops ---------------- */

  sendWorkshopRegistered(to: string, p: WorkshopRegisteredPayload, registrationId?: string) {
    return this.send(to, `Seat confirmed: ${p.workshopTitle}`, getWorkshopRegisteredTemplate(p), "workshop_registered", "workshop_registration", registrationId);
  }

  sendWorkshopReminder(to: string, p: WorkshopReminderPayload, registrationId?: string) {
    return this.send(to, `Reminder: ${p.workshopTitle}`, getWorkshopReminderTemplate(p), "workshop_reminder", "workshop_registration", registrationId);
  }

  sendWorkshopJoinInvite(to: string, p: WorkshopJoinInvitePayload, registrationId?: string) {
    return this.send(to, "Continue learning with Saarthi Classes", getWorkshopJoinInviteTemplate(p), "workshop_join_invite", "workshop_registration", registrationId);
  }

  /* ---------------- Joining ---------------- */

  sendJoinRequestReceived(to: string, p: JoinRequestReceivedPayload, joinRequestId?: string) {
    return this.send(to, "We've received your join request | Saarthi Classes", getJoinRequestReceivedTemplate(p), "join_request_received", "join_request", joinRequestId);
  }

  /** Alerts for the team. Skipped with a warning when ADMIN_NOTIFICATION_EMAIL and EMAIL_REPLY_TO are both unset. */
  async sendAdminAlert(
    subject: string,
    html: string,
    options: { type: string; relatedEntityType?: string; relatedEntityId?: string; replyTo?: string }
  ): Promise<SendEmailResponse> {
    if (!EMAIL_DEFAULTS.ADMIN) {
      console.warn(`[EmailService] Admin alert not sent, no ADMIN_NOTIFICATION_EMAIL or EMAIL_REPLY_TO set. Subject: ${subject}`);
      return { success: false, error: "No admin email configured" };
    }
    return this.sendHtmlEmail(EMAIL_DEFAULTS.ADMIN, subject, html, EMAIL_DEFAULTS.FROM, options);
  }

  sendNewJoinRequestInternal(p: NewJoinRequestInternalPayload, joinRequestId?: string) {
    return this.sendAdminAlert(`[Join request] ${p.studentName} · ${p.batchName}`, getNewJoinRequestInternalTemplate(p), {
      type: "join_request_internal",
      relatedEntityType: "join_request",
      relatedEntityId: joinRequestId,
    });
  }

  sendJoinRequestApproved(to: string, p: JoinRequestApprovedPayload, joinRequestId?: string) {
    return this.send(to, "Your seat is approved: complete payment | Saarthi Classes", getJoinRequestApprovedTemplate(p), "join_request_approved", "join_request", joinRequestId);
  }

  sendJoinRequestDeclined(to: string, p: JoinRequestDeclinedPayload, joinRequestId?: string) {
    return this.send(to, "About your join request | Saarthi Classes", getJoinRequestDeclinedTemplate(p), "join_request_declined", "join_request", joinRequestId);
  }

  sendEnrollmentConfirmed(to: string, p: EnrollmentConfirmedPayload, joinRequestId?: string) {
    return this.send(to, "Welcome to Saarthi Classes: set up your account", getEnrollmentConfirmedTemplate(p), "enrollment_confirmed", "join_request", joinRequestId);
  }

  /* ---------------- Accounts ---------------- */

  sendPasswordSetup(to: string, p: PasswordSetupPayload, userId?: string) {
    return this.send(to, "Set your password | Saarthi Classes", getPasswordSetupTemplate(p), "password_setup", "profile", userId);
  }

  sendPasswordReset(to: string, p: PasswordResetPayload) {
    return this.send(to, "Reset your Saarthi Classes password", getPasswordResetTemplate(p), "password_reset");
  }

  sendWeeklyReport(to: string, p: WeeklyReportPayload, studentId?: string) {
    return this.send(to, `${p.studentName}’s week at Saarthi Classes`, getWeeklyReportTemplate(p), "weekly_report", "profile", studentId);
  }

  sendTeacherActivation(to: string, p: TeacherActivationPayload, teacherId?: string): Promise<SendEmailResponse> {
    return this.send(to, "Your Saarthi Classes teacher account", getTeacherActivationTemplate(p), "teacher_activation", "profile", teacherId);
  }
}

/* ============================================================
 * Singleton
 * ============================================================ */

export const emailService = new EmailService();
