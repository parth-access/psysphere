import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import { batches } from "../core/batches";
import { profiles } from "../core/profiles";
import { timestamps, auditColumns } from "../common";
import { classSessionStatusEnum } from "../enums";

export const classSessions = pgTable(
  "class_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, {
        onDelete: "cascade",
      }),

    teacherId: uuid("teacher_id")
      .references(() => profiles.id, {
        onDelete: "set null",
      }),

    title: text("title").notNull(),

    topicTitle: text("topic_title").notNull(),

    meetingUrl: text("meeting_url").notNull(),

    startsAt: timestamp("starts_at", {
      withTimezone: true,
    }).notNull(),

    endsAt: timestamp("ends_at", {
      withTimezone: true,
    }).notNull(),

    status: classSessionStatusEnum("status")
      .default("scheduled")
      .notNull(),

    teacherNotes: text("teacher_notes"),

    googleEventId: text("google_event_id"),

    /** When join/leave times were last read from Google Meet, and why the last read failed, if it did. */
    meetSyncedAt: timestamp("meet_synced_at", { withTimezone: true }),

    meetSyncError: text("meet_sync_error"),

    ...timestamps,

    ...auditColumns,
  },
  (table) => ({
    batchIdx: index("class_sessions_batch_idx").on(table.batchId),

    statusIdx: index("class_sessions_status_idx").on(table.status),

    startIdx: index("class_sessions_start_idx").on(table.startsAt),

    teacherIdx: index("class_sessions_teacher_idx").on(table.teacherId),
  })
);
