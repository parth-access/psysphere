import { Resend } from "resend";
import { EMAIL_DEFAULTS } from "./constants";
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
  TeacherActivationPayload
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
  getTeacherActivationTemplate
} from "./templates";

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "MY_RESEND_API_KEY") {
    console.warn(
      "⚠️ [EmailService] RESEND_API_KEY is missing or unconfigured. Email delivery will be skipped."
    );
    return null;
  }

  try {
    resendInstance = new Resend(apiKey);
    return resendInstance;
  } catch (error) {
    console.error("❌ [EmailService] Failed to initialize Resend client:", error);
    return null;
  }
}

export class EmailService {
  /**
   * General-purpose low-level HTML email sender
   */
  async sendHtmlEmail(
    to: string, 
    subject: string, 
    htmlContent: string, 
    from: string = EMAIL_DEFAULTS.FROM
  ): Promise<SendEmailResponse> {
    const resend = getResendClient();

    if (!resend) {
      console.warn(
        `[EmailService] Unsent - Resend is not configured. Target: ${to}, Subject: ${subject}`
      );
      return {
        success: false,
        error: "Email service is not configured"
      };
    }

    try {
      const result = await resend.emails.send({
        from,
        to,
        subject,
        html: htmlContent,
        replyTo: EMAIL_DEFAULTS.REPLY_TO,
      });

      if (result.error) {
        console.error("❌ [EmailService] Resend returned an error:", result.error);
        return { success: false, error: result.error.message };
      }

      console.log(`✅ [EmailService] Successfully sent email to ${to} (ID: ${result.data?.id})`);
      return { success: true, data: result.data };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ [EmailService] Exception caught sending email to ${to}:`, error);
      return { success: false, error: errMsg };
    }
  }

  /**
   * Sends the Demo Approved confirmation email
   */
  async sendDemoApproved(to: string, payload: DemoApprovedPayload): Promise<SendEmailResponse> {
    const html = getDemoApprovedTemplate(payload);
    const subject = `Welcome to PsySphere | Your Demo Class is Confirmed`;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Sends the Account Set-up / Student Invitation email
   */
  async sendStudentInvitation(to: string, payload: StudentInvitationPayload): Promise<SendEmailResponse> {
    const html = getStudentInvitationTemplate(payload);
    const subject = `Welcome to PsySphere | Setup Your Account`;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Sends a Password Setup or Reset link directly
   */
  async sendPasswordSetup(to: string, payload: PasswordSetupPayload): Promise<SendEmailResponse> {
    const html = getPasswordSetupTemplate(payload);
    const subject = `PsySphere | Create Your Password`;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Sends the Welcome Core Student notification
   */
  async sendWelcomeStudent(to: string, payload: WelcomeStudentPayload): Promise<SendEmailResponse> {
    const html = getWelcomeStudentTemplate(payload);
    const subject = `Welcome to PsySphere Core Student Portal`;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Sends the Demo Request Received confirmation email to the applicant
   */
  async sendDemoRequestReceived(to: string, payload: DemoRequestReceivedPayload): Promise<SendEmailResponse> {
    const html = getDemoRequestReceivedTemplate(payload);
    const subject = `Demo Class Request Received | PsySphere`;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Sends the New Lead Internal notification to the admin email (psysphereclasses@gmail.com)
   */
  async sendNewLeadInternal(payload: NewLeadInternalPayload): Promise<SendEmailResponse> {
    const html = getNewLeadInternalTemplate(payload);
    const subject = `[NEW LEAD] Demo Request - ${payload.studentName}`;
    const adminEmail = process.env.EMAIL_REPLY_TO || "psysphereclasses@gmail.com";
    return this.sendHtmlEmail(adminEmail, subject, html);
  }

  /**
   * Sends the Demo Scheduled email to the applicant
   */
  async sendDemoScheduled(to: string, payload: DemoScheduledPayload, isRescheduled?: boolean): Promise<SendEmailResponse> {
    const html = getDemoScheduledTemplate(payload, isRescheduled);
    const subject = isRescheduled 
      ? `Your Live Demo has been Rescheduled! | PsySphere`
      : `Your Live Demo is Scheduled! | PsySphere`;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Sends the Demo Rejected/Cancelled email to the applicant
   */
  async sendDemoRejected(to: string, payload: DemoRejectedPayload): Promise<SendEmailResponse> {
    const html = getDemoRejectedTemplate(payload);
    const subject = `Demo Request Update | PsySphere`;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Sends the Teacher Invitation / Activation email
   */
  async sendTeacherActivation(to: string, payload: TeacherActivationPayload): Promise<SendEmailResponse> {
    const html = getTeacherActivationTemplate(payload);
    const subject = `Welcome to PsySphere Faculty | Activate Your Account`;
    return this.sendHtmlEmail(to, subject, html);
  }
}

export const emailService = new EmailService();
