"use server";

import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema/core/contactMessages";
import { emailService } from "@/src/domains/email/service";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().max(20).optional().transform((v) => v || null),
  topic: z.enum(["Joining a batch", "Free workshops", "Fees and payments", "Something else"]),
  message: z.string().trim().min(10, "Please write a little more").max(3000),
});

export type ContactState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string>; message?: string }
  | { status: "sent" };

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function contactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  if (formData.get("website")) return { status: "sent" }; // bot honeypot

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { status: "error", errors };
  }
  const v = parsed.data;

  try {
    const [row] = await db.insert(contactMessages).values(v).returning({ id: contactMessages.id });
    const html = `
      <h1>New message: ${esc(v.topic)}</h1>
      <p><strong>${esc(v.name)}</strong> · ${esc(v.email)}${v.phone ? ` · ${esc(v.phone)}` : ""}</p>
      <p style="white-space:pre-line">${esc(v.message)}</p>`;
    await emailService.sendAdminAlert(
      `[Contact] ${v.topic} · ${v.name}`,
      html,
      // Hitting Reply answers the person who wrote in, not the no-reply address.
      { type: "contact_message", relatedEntityType: "contact_message", relatedEntityId: row.id, replyTo: v.email }
    );
    return { status: "sent" };
  } catch (err) {
    console.error("[contact]", err);
    return { status: "error", errors: {}, message: "We couldn’t send that. Please email or WhatsApp us instead." };
  }
}
