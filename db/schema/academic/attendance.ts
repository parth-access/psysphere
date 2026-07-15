import {
  pgTable,
  uuid,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { classSessions } from "./classSessions";
import { studentProfiles } from "../core/studentProfiles";
import { profiles } from "../core/profiles";
import { timestamps } from "../common";
import { attendanceStatusEnum } from "../enums";

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    sessionId: uuid("session_id")
      .notNull()
      .references(() => classSessions.id, {
        onDelete: "cascade",
      }),

    studentProfileId: uuid("student_profile_id")
      .notNull()
      .references(() => studentProfiles.profileId, {
        onDelete: "cascade",
      }),

    status: attendanceStatusEnum("status")
      .default("absent")
      .notNull(),

    markedBy: uuid("marked_by")
      .references(() => profiles.id, {
        onDelete: "set null",
      }),

    markedAt: timestamp("marked_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    ...timestamps,
  },
  (table) => ({
    sessionIdx: index("attendance_session_idx").on(table.sessionId),

    studentIdx: index("attendance_student_idx").on(table.studentProfileId),

    uniqueAttendance: unique("attendance_session_student_unique").on(
      table.sessionId,
      table.studentProfileId
    ),
  })
);
