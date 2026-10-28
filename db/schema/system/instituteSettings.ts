import { pgTable, integer, text, boolean, timestamp, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "../core/profiles";

/**
 * The one row of settings admins change from Settings. Anything left empty falls back to the defaults in
 * constants/site.ts, so the site works before anyone has saved.
 */
export const instituteSettings = pgTable(
  "institute_settings",
  {
    id: integer("id").primaryKey().default(1),
    contactEmail: text("contact_email"),
    phone: text("phone"),
    /** Digits with country code, for wa.me links. */
    whatsappNumber: text("whatsapp_number"),
    whatsappMessage: text("whatsapp_message"),
    hours: text("hours"),
    address: text("address"),
    /** "HH:MM", India time. */
    defaultClassTime: text("default_class_time"),
    defaultClassMinutes: integer("default_class_minutes"),
    defaultBatchSeats: integer("default_batch_seats"),
    /** Where team alerts go (join requests, contact messages, payment problems). */
    alertEmail: text("alert_email"),
    weeklyReports: boolean("weekly_reports").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid("updated_by").references(() => profiles.id, { onDelete: "set null" }),
  },
  (t) => [check("institute_settings_single_row", sql`${t.id} = 1`)]
);
