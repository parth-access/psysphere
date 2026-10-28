import { unstable_cache, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { instituteSettings } from "@/db/schema/system/instituteSettings";
import { SITE } from "@/constants/site";

export type Settings = {
  contactEmail: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  hours: string;
  address: string;
  defaultClassTime: string;
  defaultClassMinutes: number;
  defaultBatchSeats: number | null;
  /** Empty means "use ADMIN_NOTIFICATION_EMAIL / EMAIL_REPLY_TO from the hosting settings". */
  alertEmail: string | null;
  weeklyReports: boolean;
  updatedAt: string | null;
};

export const DEFAULT_SETTINGS: Settings = {
  contactEmail: SITE.email,
  phone: SITE.phone,
  whatsappNumber: SITE.phoneDigits,
  whatsappMessage: SITE.whatsappMessage,
  hours: SITE.hours,
  address: SITE.address,
  defaultClassTime: "18:00",
  defaultClassMinutes: 60,
  defaultBatchSeats: null,
  alertEmail: null,
  weeklyReports: true,
  updatedAt: null,
};

const TAG = "institute-settings";

async function readSettings(): Promise<Settings> {
  try {
    const [row] = await db.select().from(instituteSettings).where(eq(instituteSettings.id, 1));
    if (!row) return DEFAULT_SETTINGS;
    const d = DEFAULT_SETTINGS;
    return {
      contactEmail: row.contactEmail || d.contactEmail,
      phone: row.phone || d.phone,
      whatsappNumber: row.whatsappNumber || d.whatsappNumber,
      whatsappMessage: row.whatsappMessage || d.whatsappMessage,
      hours: row.hours || d.hours,
      address: row.address || d.address,
      defaultClassTime: row.defaultClassTime || d.defaultClassTime,
      defaultClassMinutes: row.defaultClassMinutes || d.defaultClassMinutes,
      defaultBatchSeats: row.defaultBatchSeats ?? d.defaultBatchSeats,
      alertEmail: row.alertEmail || null,
      weeklyReports: row.weeklyReports,
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (err) {
    console.error("[settings] using defaults, could not read settings:", err);
    return DEFAULT_SETTINGS;
  }
}

const cachedSettings = unstable_cache(readSettings, [TAG], { tags: [TAG] });

/**
 * The saved settings, with defaults for anything never set. Cached until an admin saves (which clears it),
 * so the public pages stay fast. If the database can't be reached, the defaults keep the site working.
 * Outside the app (scripts), where the cache isn't available, it reads the database directly.
 */
export async function getSettings(): Promise<Settings> {
  try {
    return await cachedSettings();
  } catch {
    return readSettings();
  }
}

export type SettingsPatch = Partial<Omit<typeof instituteSettings.$inferInsert, "id" | "updatedAt" | "updatedBy">>;

export async function saveSettings(patch: SettingsPatch, by: string) {
  const values = { ...patch, updatedAt: new Date(), updatedBy: by };
  await db
    .insert(instituteSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: instituteSettings.id, set: values });
  // Every page and email that shows these picks up the change on its next view.
  revalidateTag(TAG);
}

export function whatsappLink(s: Pick<Settings, "whatsappNumber" | "whatsappMessage">, text = s.whatsappMessage) {
  return `https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/** tel: link for a phone number as typed ("+91 89202 29024" or a plain 10-digit Indian number). */
export function telLink(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `tel:+${d.length === 10 ? `91${d}` : d}`;
}
