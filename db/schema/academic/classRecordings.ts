import { pgTable, uuid, text, timestamp, bigint, index } from "drizzle-orm/pg-core";

import { classSessions } from "./classSessions";
import { profiles } from "../core/profiles";
import { timestamps } from "../common";
import { classRecordingStatusEnum } from "../enums";

/** A class's recording in the institute's Google Drive. The row outlives the file, so students can see "Recording expired". */
export const classRecordings = pgTable(
  "class_recordings",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    sessionId: uuid("session_id")
      .notNull()
      .unique()
      .references(() => classSessions.id, { onDelete: "cascade" }),

    driveFileId: text("drive_file_id").notNull(),

    /** The name on the teacher's computer. The file in Drive gets a neutral one, since viewers can see it. */
    fileName: text("file_name").notNull(),

    bytes: bigint("bytes", { mode: "number" }).notNull(),

    status: classRecordingStatusEnum("status").default("processing").notNull(),

    /** Set when Drive finishes processing, which is when the 24 hours start. */
    availableFrom: timestamp("available_from", { withTimezone: true }),

    expiresAt: timestamp("expires_at", { withTimezone: true }),

    /** When Drive was last asked whether processing had finished. */
    checkedAt: timestamp("checked_at", { withTimezone: true }),

    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    /** Why the last attempt to delete the file failed. It's tried again until it works. */
    deleteError: text("delete_error"),

    uploadedBy: uuid("uploaded_by").references(() => profiles.id, { onDelete: "set null" }),

    ...timestamps,
  },
  (table) => ({
    statusIdx: index("class_recordings_status_idx").on(table.status),
  })
);
