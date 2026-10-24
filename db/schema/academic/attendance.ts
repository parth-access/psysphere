import {
  pgTable,
  uuid,
  timestamp,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { classSessions } from "./classSessions";
import { studentProfiles } from "../core/studentProfiles";
import { profiles } from "../core/profiles";
import { timestamps } from "../common";
import { attendanceStatusEnum, attendanceSourceEnum } from "../enums";

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

    source: attendanceSourceEnum("source").default("manual").notNull(),

    /** From Meet: minutes in the class, and the longest single stretch away (late joining and leaving early count). */
    minutesPresent: integer("minutes_present"),

    longestGapMinutes: integer("longest_gap_minutes"),

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
