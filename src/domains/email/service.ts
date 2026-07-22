import { Resend } from "resend";
import { EMAIL_DEFAULTS } from "./constants";
import { 
  SendEmailResponse, 
  DemoApprovedPayload, 
  StudentInvitationPayload, 
  PasswordSetupPayload, 
  WelcomeStudentPayload 
} from "./types";
import { 
  getDemoApprovedTemplate, 
  getStudentInvitationTemplate, 
  getPasswordSetupTemplate, 
  getWelcomeStudentTemplate 
} from "./templates";

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "MY_RESEND_API_KEY") {
    console.warn(
      "⚠️ [EmailService] RESEND_API_KEY is missing or unconfigured. Running in Mock/Simulated Email Mode."
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
      console.log(`
📱 [EmailService SIMULATOR]
To:      ${to}
From:    ${from}
Subject: ${subject}
----------------- CONTENT -----------------
An email was successfully generated. Below is a raw excerpt of the HTML payload:
${htmlContent.slice(0, 800)}...
-------------------------------------------
      `);
      return { success: true, data: { id: `mock_email_${Math.random().toString(36).substring(7)}`, simulated: true } };
    }

    try {
      const result = await resend.emails.send({
        from,
        to,
        subject,
        html: htmlContent,
      });

      if (result.error) {
        console.error("❌ [EmailService] Resend returned an error:", result.error);
        return { success: false, error: result.error.message };
      }

      console.log(`✅ [EmailService] Successfully sent email to ${to} (ID: ${result.data?.id})`);
      return { success: true, data: result.data };
    } catch (error: any) {
      console.error(`❌ [EmailService] Exception caught sending email to ${to}:`, error);
      return { success: false, error: error?.message || String(error) };
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
}

export const emailService = new EmailService();
