"use server";

import { requireRole } from "@/server/authorization/requireRole";
import { disconnectGoogle } from "@/server/integrations/google";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { saveSettings } from "@/src/domains/settings/service";

export async function disconnectGoogleAction() {
  // Disconnect is restricted strictly to Admins
  await requireRole(["admin"]);
  await disconnectGoogle();
  revalidatePath("/dashboard/settings");
}

export type SettingsState = { ok?: string; error?: string; values?: Record<string, string> };

const typed = (formData: FormData) =>
  Object.fromEntries([...formData].filter((e): e is [string, string] => typeof e[1] === "string").map(([k, v]) => [k, v.trim()]));
const fail = (parsed: { error: z.ZodError }, values: Record<string, string>): SettingsState => ({ error: parsed.error.issues[0]?.message, values });

/** "+91 89202 29024" or "8920229024" → "918920229024" (a 10-digit number is taken as Indian). */
function waDigits(v: string) {
  const d = v.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
}

const contactSchema = z.object({
  contactEmail: z.string().toLowerCase().email("Enter a valid contact email"),
  phone: z.string().min(8, "Enter the phone number people should call").max(20),
  whatsappNumber: z
    .string()
    .transform(waDigits)
    .refine((d) => d.length >= 11 && d.length <= 15, "Enter the WhatsApp number with its country code, like +91 89202 29024"),
  whatsappMessage: z.string().min(5, "Write the message WhatsApp starts with").max(300),
  hours: z.string().min(3, "Enter your hours").max(80),
  address: z.string().min(3, "Enter a city or address").max(120),
});

export async function saveContactAction(_p: SettingsState, formData: FormData): Promise<SettingsState> {
  const me = await requireRole(["admin"]);
  const values = typed(formData);
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return fail(parsed, values);
  await saveSettings(parsed.data, me.id);
  revalidatePath("/", "layout");
  return { ok: "Saved. The website and emails use these now." };
}

const classSchema = z.object({
  defaultClassTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a start time"),
  defaultClassMinutes: z.coerce.number().int().min(15, "Classes need to be at least 15 minutes").max(240, "Keep classes under 4 hours"),
  defaultBatchSeats: z
    .string()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 500), "Seats must be a whole number from 1 to 500, or empty for no limit"),
});

export async function saveClassDefaultsAction(_p: SettingsState, formData: FormData): Promise<SettingsState> {
  const me = await requireRole(["admin"]);
  const values = typed(formData);
  const parsed = classSchema.safeParse(values);
  if (!parsed.success) return fail(parsed, values);
  await saveSettings(parsed.data, me.id);
  return { ok: "Saved. New classes and batches start with these." };
}

const notifySchema = z.object({
  alertEmail: z
    .string()
    .toLowerCase()
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email, or leave it empty")
    .transform((v) => v || null),
  weeklyReports: z.literal("on").optional().transform((v) => v === "on"),
});

export async function saveNotificationsAction(_p: SettingsState, formData: FormData): Promise<SettingsState> {
  const me = await requireRole(["admin"]);
  const values = typed(formData);
  const parsed = notifySchema.safeParse(values);
  if (!parsed.success) return fail(parsed, values);
  await saveSettings(parsed.data, me.id);
  return { ok: "Saved." };
}
