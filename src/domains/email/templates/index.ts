import { renderBaseEmailLayout } from "./layout";
import type {
  WorkshopRegisteredPayload,
  WorkshopReminderPayload,
  WorkshopJoinInvitePayload,
  JoinRequestReceivedPayload,
  NewJoinRequestInternalPayload,
  JoinRequestApprovedPayload,
  JoinRequestDeclinedPayload,
  EnrollmentConfirmedPayload,
  PasswordSetupPayload,
  TeacherActivationPayload,
  WeeklyReportPayload,
} from "../types";

/** Escape user-supplied text before putting it into email HTML. */
function e(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function row(label: string, value: string) {
  return `
    <div class="highlight-item" style="margin-top: 12px;">
      <div class="highlight-label">${e(label)}</div>
      <div class="highlight-value">${value}</div>
    </div>`;
}

function button(href: string, label: string) {
  return `<div class="btn-container"><a href="${e(href)}" class="btn" target="_blank">${e(label)}</a></div>`;
}

const signOff = `<p>Warmly,<br>Dravina Gupta<br>Saarthi Classes</p>`;

/* ------------------------------------------------------------------ */
/* Workshops                                                           */
/* ------------------------------------------------------------------ */

export function getWorkshopRegisteredTemplate(p: WorkshopRegisteredPayload): string {
  const content = `
    <h1>You're in! See you at the workshop</h1>
    <p>Hi ${e(p.studentName)},</p>
    <p>Your seat for our free psychology workshop is confirmed.</p>
    <div class="highlight-box">
      ${row("Workshop", e(p.workshopTitle))}
      ${row("When", e(p.whenText))}
      ${p.meetingUrl ? row("Google Meet", `<a href="${e(p.meetingUrl)}">${e(p.meetingUrl)}</a>`) : ""}
    </div>
    ${p.meetingUrl ? button(p.meetingUrl, "Join on Google Meet") : `<p>We'll email you the meeting link before the workshop starts.</p>`}
    <p>Join from a laptop or phone a couple of minutes early. Bring a notebook and any questions you have about psychology or the board exams.</p>
    ${signOff}
  `;
  return renderBaseEmailLayout("Workshop seat confirmed | Saarthi Classes", content);
}

export function getWorkshopReminderTemplate(p: WorkshopReminderPayload): string {
  const content = `
    <h1>Reminder: your workshop is coming up</h1>
    <p>Hi ${e(p.studentName)},</p>
    <p><strong>${e(p.workshopTitle)}</strong> is on ${e(p.whenText)}.</p>
    ${p.meetingUrl ? button(p.meetingUrl, "Join on Google Meet") : ""}
    ${signOff}
  `;
  return renderBaseEmailLayout("Workshop reminder | Saarthi Classes", content);
}

export function getWorkshopJoinInviteTemplate(p: WorkshopJoinInvitePayload): string {
  const content = `
    <h1>Thank you for coming!</h1>
    <p>Hi ${e(p.studentName)},</p>
    <p>Thank you for joining <strong>${e(p.workshopTitle)}</strong>. If you enjoyed learning this way and want to continue through the year, you can request a seat in one of our small batches.</p>
    ${button(p.joinUrl, "Join a batch")}
    <p>You'll see the batches, timings and fees on the next page. Your parent's details are needed to complete the request.</p>
    ${signOff}
  `;
  return renderBaseEmailLayout("Continue learning with Saarthi Classes", content);
}

/* ------------------------------------------------------------------ */
/* Joining                                                             */
/* ------------------------------------------------------------------ */

export function getJoinRequestReceivedTemplate(p: JoinRequestReceivedPayload): string {
  const content = `
    <h1>We've received your request</h1>
    <p>Hi ${e(p.studentName)},</p>
    <p>Thank you for requesting a seat. Dravina will review it shortly, and you'll get an email with a payment link once it's approved.</p>
    <div class="highlight-box">
      ${row("Batch", e(p.batchName))}
      ${row("Plan", e(p.planName))}
      ${row("Fee", e(inr(p.amountInr)))}
    </div>
    ${signOff}
  `;
  return renderBaseEmailLayout("Join request received | Saarthi Classes", content);
}

export function getNewJoinRequestInternalTemplate(p: NewJoinRequestInternalPayload): string {
  const content = `
    <h1>New join request</h1>
    <div class="highlight-box">
      ${row("Student", e(p.studentName))}
      ${row("Email", e(p.email))}
      ${row("Phone", e(p.phone))}
      ${row("Parent", `${e(p.parentName)} · ${e(p.parentPhone)}`)}
      ${row("Batch", e(p.batchName))}
      ${row("Plan", `${e(p.planName)} · ${e(inr(p.amountInr))}`)}
    </div>
    ${button(p.reviewUrl, "Review request")}
  `;
  return renderBaseEmailLayout("New join request | Saarthi Classes", content);
}

export function getJoinRequestApprovedTemplate(p: JoinRequestApprovedPayload): string {
  const content = `
    <h1>Your seat is approved</h1>
    <p>Hi ${e(p.studentName)},</p>
    <p>Good news: your request to join <strong>${e(p.batchName)}</strong> has been approved. Complete the payment to confirm your seat. Your student account is created as soon as the payment goes through.</p>
    <div class="highlight-box">
      ${row("Plan", e(p.planName))}
      ${row("Fee", e(inr(p.amountInr)))}
    </div>
    ${button(p.payUrl, "Pay and confirm seat")}
    <p>This payment link is valid for 7 days.</p>
    ${signOff}
  `;
  return renderBaseEmailLayout("Your seat is approved | Saarthi Classes", content);
}

export function getJoinRequestDeclinedTemplate(p: JoinRequestDeclinedPayload): string {
  const content = `
    <h1>About your join request</h1>
    <p>Hi ${e(p.studentName)},</p>
    <p>We're sorry, we can't offer a seat in <strong>${e(p.batchName)}</strong> right now.</p>
    ${p.reason ? `<p>${e(p.reason)}</p>` : ""}
    <p>You're welcome to reply to this email and we'll help you find another batch or our next free workshop.</p>
    ${signOff}
  `;
  return renderBaseEmailLayout("About your join request | Saarthi Classes", content);
}

export function getEnrollmentConfirmedTemplate(p: EnrollmentConfirmedPayload): string {
  const content = `
    <h1>Welcome to Saarthi Classes</h1>
    <p>Hi ${e(p.studentName)},</p>
    <p>Your payment was received and your seat in <strong>${e(p.batchName)}</strong> is confirmed.</p>
    <div class="highlight-box">
      ${row("Student ID", e(p.studentId))}
      ${row("Login email", e(p.email))}
      ${row("Plan", `${e(p.planName)} · ${e(inr(p.amountInr))}`)}
      ${row("Payment ID", e(p.paymentId))}
    </div>
    <p>Set your password to open your student dashboard, where you'll find your class timings, Google Meet links, assignments and test results.</p>
    ${button(p.passwordSetupUrl, "Set your password")}
    <p>This link expires in 24 hours. If it does, use "Forgot password" on the sign-in page.</p>
    ${signOff}
  `;
  return renderBaseEmailLayout("Welcome to Saarthi Classes", content);
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export function getPasswordSetupTemplate(p: PasswordSetupPayload): string {
  const content = `
    <h1>Set your password</h1>
    <p>Hi ${e(p.studentName)},</p>
    <p>Use the button below to set a password for <strong>${e(p.email)}</strong>.</p>
    ${button(p.passwordSetupUrl, "Set password")}
    <p>If you didn't ask for this, you can ignore this email.</p>
    ${signOff}
  `;
  return renderBaseEmailLayout("Set your password | Saarthi Classes", content);
}

export function getTeacherActivationTemplate(p: TeacherActivationPayload): string {
  const content = `
    <h1>Welcome to the Saarthi Classes faculty</h1>
    <p>Hi ${e(p.teacherName)},</p>
    <p>A teacher account has been created for you (${e(p.email)}). Set your password to manage your batches, classes and attendance.</p>
    ${button(p.passwordSetupUrl, "Activate account")}
    ${signOff}
  `;
  return renderBaseEmailLayout("Your teacher account | Saarthi Classes", content);
}

/* ------------------------------------------------------------------ */
/* Weekly parent report                                                */
/* ------------------------------------------------------------------ */

export function getWeeklyReportTemplate(p: WeeklyReportPayload): string {
  const list = (items: string[]) => (items.length ? `<ul class="bullet-list">${items.map((i) => `<li class="bullet-item">${i}</li>`).join("")}</ul>` : `<p>None this week.</p>`);
  const content = `
    <h1>${e(p.studentName)}’s week</h1>
    <p>${e(p.weekLabel)} · ${e(p.batchName)}</p>
    <div class="highlight-box">
      ${row("Classes attended", p.totalClasses ? `${p.attended} of ${p.totalClasses}` : "No classes this week")}
    </div>
    <h2>Marks</h2>
    ${list(p.results.map((r) => `<strong>${e(r.title)}</strong>: ${e(r.marks)} / ${e(r.max)}${r.feedback ? `. “${e(r.feedback)}”` : ""}`))}
    <h2>Work still to submit</h2>
    ${list(p.pendingWork.map((w) => `${e(w.title)} (due ${e(w.dueText)})`))}
    <h2>Coming up</h2>
    ${list(p.upcoming.map((u) => `${e(u.title)}, ${e(u.whenText)}`))}
    ${button(p.dashboardUrl, "Open student dashboard")}
    <p>Questions? Just reply to this email.</p>
    ${signOff}
  `;
  return renderBaseEmailLayout("Weekly progress | Saarthi Classes", content);
}
