import { SITE } from "@/constants/site";
import { C, SANS, SERIF, renderBaseEmailLayout } from "./layout";
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
  PasswordResetPayload,
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
const firstName = (name: string | null | undefined) => (name ?? "").trim().split(/\s+/)[0] || "there";

/* ------------------------------------------------------------------ */
/* Building blocks (all inline-styled; see layout.ts)                  */
/* ------------------------------------------------------------------ */

/** Small gold label above the heading. */
const eyebrow = (text: string) =>
  `<p style="margin:0 0 10px 0;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${C.gold700};">${e(text)}</p>`;

const h1 = (text: string) =>
  `<h1 class="h1" style="margin:0 0 18px 0;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:normal;color:${C.ink900};">${text}</h1>`;

const h2 = (text: string) =>
  `<h2 style="margin:28px 0 10px 0;font-family:${SERIF};font-size:20px;line-height:1.3;font-weight:normal;color:${C.ink900};">${text}</h2>`;

const p = (html: string, extra = "") => `<p style="margin:0 0 16px 0;${extra}">${html}</p>`;

const small = (html: string) => p(html, `font-size:14px;color:${C.ink500};`);

/** A soft card of label/value pairs. Values are trusted HTML; escape before passing. */
function details(rows: [string, string][]) {
  const cells = rows
    .map(
      ([label, value], i) => `
      <tr>
        <td style="padding:${i === 0 ? "18px" : "12px"} 22px ${i === rows.length - 1 ? "18px" : "0"} 22px;">
          <div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.ink500};">${e(label)}</div>
          <div style="font-family:${SANS};font-size:16px;line-height:1.45;font-weight:600;color:${C.ink900};margin-top:3px;">${value}</div>
        </td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px 0;background-color:${C.paper};border:1px solid ${C.line};border-radius:16px;">${cells}</table>`;
}

/** Bulletproof pill button: a table cell carries the colour so Outlook shows it too. */
function button(href: string, label: string, tone: "green" | "gold" = "green") {
  const bg = tone === "gold" ? C.gold500 : C.forest800;
  const fg = tone === "gold" ? C.ink900 : C.white;
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
    <tr>
      <td align="center" bgcolor="${bg}" style="border-radius:999px;background-color:${bg};">
        <a href="${e(href)}" target="_blank" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:16px;font-weight:700;line-height:1;color:${fg};text-decoration:none;border-radius:999px;">${e(label)} &rarr;</a>
      </td>
    </tr>
  </table>`;
}

/** The button's address as plain text, for when the button doesn't work. */
const fallbackLink = (href: string) =>
  small(`If the button doesn't work, copy this link into your browser:<br><a href="${e(href)}" style="color:${C.forest800};word-break:break-all;">${e(href)}</a>`);

function list(items: string[], empty = "Nothing this week.") {
  if (!items.length) return p(empty, `color:${C.ink500};`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px 0;">${items
    .map(
      (i) => `<tr>
        <td style="width:18px;vertical-align:top;padding:2px 0 10px 0;"><div style="width:7px;height:7px;margin-top:9px;border-radius:999px;background-color:${C.gold500};"></div></td>
        <td style="vertical-align:top;padding:0 0 10px 0;font-size:15px;line-height:1.6;color:${C.ink700};">${i}</td>
      </tr>`
    )
    .join("")}</table>`;
}

const signOff = `
  <p style="margin:28px 0 4px 0;">Warmly,</p>
  <p style="margin:0 0 4px 0;font-family:${SERIF};font-style:italic;font-size:20px;color:${C.ink900};">Dravina Gupta</p>
  <p style="margin:0 0 8px 0;font-size:14px;color:${C.ink500};">Saarthi Classes</p>`;

/* ------------------------------------------------------------------ */
/* Workshops                                                           */
/* ------------------------------------------------------------------ */

export function getWorkshopRegisteredTemplate(x: WorkshopRegisteredPayload): string {
  const content = `
    ${eyebrow("Free workshop")}
    ${h1("You're in. See you there!")}
    ${p(`Hi ${e(firstName(x.studentName))},`)}
    ${p(`Your seat is saved. It's a relaxed, live session, so come with questions about psychology, the board exam or CUET.`)}
    ${details([
      ["Workshop", e(x.workshopTitle)],
      ["When", e(x.whenText)],
      ...(x.meetingUrl ? ([["Google Meet", `<a href="${e(x.meetingUrl)}" style="color:${C.forest800};">${e(x.meetingUrl)}</a>`]] as [string, string][]) : []),
    ])}
    ${x.meetingUrl ? button(x.meetingUrl, "Join on Google Meet") : p(`We'll email you the Meet link before it starts.`)}
    ${small(`Join a couple of minutes early from a laptop or phone, and keep a notebook handy.`)}
    ${signOff}`;
  return renderBaseEmailLayout("Workshop seat confirmed | Saarthi Classes", content, `Your seat for ${e(x.workshopTitle)} on ${e(x.whenText)} is confirmed.`);
}

export function getWorkshopReminderTemplate(x: WorkshopReminderPayload): string {
  const content = `
    ${eyebrow("Reminder")}
    ${h1("Your workshop is coming up")}
    ${p(`Hi ${e(firstName(x.studentName))},`)}
    ${p(`Just a nudge: <strong style="color:${C.ink900};">${e(x.workshopTitle)}</strong> is on <strong style="color:${C.ink900};">${e(x.whenText)}</strong>.`)}
    ${x.meetingUrl ? button(x.meetingUrl, "Join on Google Meet") : ""}
    ${small(`Bring your questions. Nothing is too basic.`)}
    ${signOff}`;
  return renderBaseEmailLayout("Workshop reminder | Saarthi Classes", content, `${e(x.workshopTitle)} is on ${e(x.whenText)}.`);
}

export function getWorkshopJoinInviteTemplate(x: WorkshopJoinInvitePayload): string {
  const content = `
    ${eyebrow("Thank you")}
    ${h1("Loved having you at the workshop")}
    ${p(`Hi ${e(firstName(x.studentName))},`)}
    ${p(`Thank you for joining <strong style="color:${C.ink900};">${e(x.workshopTitle)}</strong>. If you'd like to learn this way all year, with small batches, live classes, notes and regular tests, there's a seat waiting for you.`)}
    ${button(x.joinUrl, "See batches and fees")}
    ${small(`You'll pick a batch and plan, and add a parent's details. Dravina reviews every request herself.`)}
    ${signOff}`;
  return renderBaseEmailLayout("Continue learning with Saarthi Classes", content, `Keep learning with a small live batch.`);
}

/* ------------------------------------------------------------------ */
/* Joining                                                             */
/* ------------------------------------------------------------------ */

export function getJoinRequestReceivedTemplate(x: JoinRequestReceivedPayload): string {
  const content = `
    ${eyebrow("Request received")}
    ${h1("Thanks, we've got your request")}
    ${p(`Hi ${e(firstName(x.studentName))},`)}
    ${p(`Dravina will look at your request soon. Once it's approved, we'll email you a link to pay and confirm your seat.`)}
    ${details([
      ["Batch", e(x.batchName)],
      ["Plan", e(x.planName)],
      ["Fee", e(inr(x.amountInr))],
    ])}
    ${small(`Nothing to do for now. Keep an eye on your inbox (and spam folder, just in case).`)}
    ${signOff}`;
  return renderBaseEmailLayout("Join request received | Saarthi Classes", content, `We'll email you a payment link once it's approved.`);
}

export function getNewJoinRequestInternalTemplate(x: NewJoinRequestInternalPayload): string {
  const content = `
    ${eyebrow("For the team")}
    ${h1("New join request")}
    ${details([
      ["Student", e(x.studentName)],
      ["Email", `<a href="mailto:${e(x.email)}" style="color:${C.forest800};">${e(x.email)}</a>`],
      ["Phone", e(x.phone)],
      ["Parent", `${e(x.parentName)} · ${e(x.parentPhone)}`],
      ["Batch", e(x.batchName)],
      ["Plan", `${e(x.planName)} · ${e(inr(x.amountInr))}`],
    ])}
    ${button(x.reviewUrl, "Review request")}`;
  return renderBaseEmailLayout("New join request | Saarthi Classes", content, `${e(x.studentName)} wants to join ${e(x.batchName)}.`);
}

export function getJoinRequestApprovedTemplate(x: JoinRequestApprovedPayload): string {
  const content = `
    ${eyebrow("Approved")}
    ${h1("Your seat is approved!")}
    ${p(`Hi ${e(firstName(x.studentName))},`)}
    ${p(`Good news: Dravina approved your request to join <strong style="color:${C.ink900};">${e(x.batchName)}</strong>. Pay below to lock in your seat. Your student account is created the moment the payment goes through.`)}
    ${details([
      ["Plan", e(x.planName)],
      ["Fee", e(inr(x.amountInr))],
    ])}
    ${button(x.payUrl, "Pay and confirm my seat", "gold")}
    ${small(`This payment link works for 7 days. Payments are handled securely by Razorpay.`)}
    ${fallbackLink(x.payUrl)}
    ${signOff}`;
  return renderBaseEmailLayout("Your seat is approved | Saarthi Classes", content, `Pay within 7 days to confirm your seat in ${e(x.batchName)}.`);
}

export function getJoinRequestDeclinedTemplate(x: JoinRequestDeclinedPayload): string {
  const content = `
    ${h1("About your join request")}
    ${p(`Hi ${e(firstName(x.studentName))},`)}
    ${p(`Thank you for wanting to join <strong style="color:${C.ink900};">${e(x.batchName)}</strong>. We're sorry, we can't offer you a seat in it right now.`)}
    ${x.reason ? details([["A note from Dravina", e(x.reason)]]) : ""}
    ${p(`We'd still love to help. Another batch or our next free workshop might suit you better.`)}
    ${button(`${SITE.url}/workshops`, "See free workshops")}
    ${signOff}`;
  return renderBaseEmailLayout("About your join request | Saarthi Classes", content, `An update on your request for ${e(x.batchName)}.`);
}

export function getEnrollmentConfirmedTemplate(x: EnrollmentConfirmedPayload): string {
  const content = `
    ${eyebrow("Welcome")}
    ${h1("Welcome to Saarthi Classes!")}
    ${p(`Hi ${e(firstName(x.studentName))},`)}
    ${p(`We've received your payment and your seat in <strong style="color:${C.ink900};">${e(x.batchName)}</strong> is confirmed. We're so glad you're here.`)}
    ${details([
      ["Student ID", e(x.studentId)],
      ["Login email", e(x.email)],
      ["Plan", `${e(x.planName)} · ${e(inr(x.amountInr))}`],
      ["Payment ID", e(x.paymentId)],
    ])}
    ${p(`One last step: set your password. Your dashboard has your class timings, Google Meet links, assignments, tests and notes.`)}
    ${button(x.passwordSetupUrl, "Set my password")}
    ${small(`This link works once and expires after an hour. If it has run out, use "Forgot password?" on the log-in page to get a fresh one.`)}
    ${fallbackLink(x.passwordSetupUrl)}
    ${signOff}`;
  return renderBaseEmailLayout("Welcome to Saarthi Classes", content, `Your seat in ${e(x.batchName)} is confirmed. Set your password to get started.`);
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export function getPasswordSetupTemplate(x: PasswordSetupPayload): string {
  const content = `
    ${h1("Set your password")}
    ${p(`Hi ${e(firstName(x.studentName))},`)}
    ${p(`Use the button below to set a password for <strong style="color:${C.ink900};">${e(x.email)}</strong>.`)}
    ${button(x.passwordSetupUrl, "Set my password")}
    ${small(`If you didn't ask for this, you can ignore this email.`)}
    ${fallbackLink(x.passwordSetupUrl)}
    ${signOff}`;
  return renderBaseEmailLayout("Set your password | Saarthi Classes", content, `Set a password for your Saarthi Classes account.`);
}

export function getPasswordResetTemplate(x: PasswordResetPayload): string {
  const content = `
    ${eyebrow("Password reset")}
    ${h1("Let's get you back in")}
    ${p(`Hi ${e(firstName(x.name))},`)}
    ${p(`Someone (hopefully you) asked to reset the password for your Saarthi Classes account. Tap the button to choose a new one.`)}
    ${button(x.resetUrl, "Choose a new password")}
    ${small(`This link works once and expires in 1 hour. If you didn't ask for a reset, ignore this email and your password stays the same.`)}
    ${fallbackLink(x.resetUrl)}
    ${signOff}`;
  return renderBaseEmailLayout("Reset your password | Saarthi Classes", content, `Choose a new password. The link expires in 1 hour.`);
}

export function getTeacherActivationTemplate(x: TeacherActivationPayload): string {
  const content = `
    ${eyebrow("Welcome to the team")}
    ${h1("Your teacher account is ready")}
    ${p(`Hi ${e(firstName(x.teacherName))},`)}
    ${p(`We've set up a Saarthi Classes teacher account for <strong style="color:${C.ink900};">${e(x.email)}</strong>. Set your password to see your batches, schedule classes, take attendance and set tests.`)}
    ${button(x.passwordSetupUrl, "Activate my account")}
    ${small(`This link works once. If it expires, use "Forgot password?" on the log-in page.`)}
    ${fallbackLink(x.passwordSetupUrl)}
    ${signOff}`;
  return renderBaseEmailLayout("Your teacher account | Saarthi Classes", content, `Set your password to start teaching on Saarthi Classes.`);
}

/* ------------------------------------------------------------------ */
/* Weekly parent report                                                */
/* ------------------------------------------------------------------ */

export function getWeeklyReportTemplate(x: WeeklyReportPayload): string {
  const attendance = x.totalClasses ? `${x.attended} of ${x.totalClasses} classes` : "No classes this week";
  const content = `
    ${eyebrow(`Weekly report · ${x.weekLabel}`)}
    ${h1(`${e(x.studentName)}’s week`)}
    ${p(`Here's how the week went in <strong style="color:${C.ink900};">${e(x.batchName)}</strong>.`)}
    ${details([["Attendance", e(attendance)]])}
    ${h2("Marks")}
    ${list(
      x.results.map(
        (r) => `<strong style="color:${C.ink900};">${e(r.title)}</strong>: ${e(r.marks)} / ${e(r.max)}${r.feedback ? `<br><span style="font-style:italic;color:${C.ink500};">“${e(r.feedback)}”</span>` : ""}`
      ),
      "No marks out this week."
    )}
    ${h2("Still to submit")}
    ${list(x.pendingWork.map((w) => `${e(w.title)} <span style="color:${C.ink500};">(due ${e(w.dueText)})</span>`), "All caught up.")}
    ${h2("Coming up")}
    ${list(x.upcoming.map((u) => `${e(u.title)} <span style="color:${C.ink500};">· ${e(u.whenText)}</span>`), "Nothing scheduled yet.")}
    ${button(x.dashboardUrl, "Open the dashboard")}
    ${signOff}`;
  return renderBaseEmailLayout("Weekly progress | Saarthi Classes", content, `${e(x.studentName)}: ${e(attendance)} this week.`);
}
