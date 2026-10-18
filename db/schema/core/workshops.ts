import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { classLevelEnum } from "../enums";
import { timestamps, auditColumns } from "../common";

/**
 * A free live class Dravina runs for prospective students.
 */
export const workshops = pgTable(
  "workshops",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    /** Null means the workshop is for both classes. */
    classLevel: classLevelEnum("class_level"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    /** Null means unlimited seats. */
    capacity: integer("capacity"),
    meetingUrl: text("meeting_url"),
    googleEventId: text("google_event_id"),
    isPublished: boolean("is_published").default(true).notNull(),
    remindersSentAt: timestamp("reminders_sent_at", { withTimezone: true }),
    joinInvitesSentAt: timestamp("join_invites_sent_at", { withTimezone: true }),
    ...timestamps,
    ...auditColumns,
  },
  (table) => [index("workshops_starts_at_idx").on(table.startsAt)]
);

export const workshopRegistrations = pgTable(
  "workshop_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workshopId: uuid("workshop_id")
      .notNull()
      .references(() => workshops.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    parentName: text("parent_name").notNull(),
    parentPhone: text("parent_phone").notNull(),
    classLevel: classLevelEnum("class_level").notNull(),
    attended: boolean("attended").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    index("workshop_registrations_workshop_idx").on(table.workshopId),
    index("workshop_registrations_email_idx").on(table.email),
    unique("workshop_registrations_workshop_email_unique").on(
      table.workshopId,
      table.email
    ),
  ]
);
