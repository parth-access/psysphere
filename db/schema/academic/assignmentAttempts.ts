import {
  pgTable,
  uuid,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { assignments } from "./assignments";
import { studentProfiles } from "../core/studentProfiles";
import { timestamps } from "../system/common";
import { assignmentAttemptStatusEnum } from "../system/enums";

export const assignmentAttempts = pgTable(
  "assignment_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, {
        onDelete: "cascade",
      }),

    studentProfileId: uuid("student_profile_id")
      .notNull()
      .references(() => studentProfiles.profileId, {
        onDelete: "cascade",
      }),

    attemptNumber: integer("attempt_number").default(1).notNull(),

    status: assignmentAttemptStatusEnum("status").default("draft").notNull(),

    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
    }),

    ...timestamps,
  },
  (table) => ({
    assignmentIdx: index("assignment_attempts_assignment_idx").on(
      table.assignmentId
    ),

    studentIdx: index("assignment_attempts_student_idx").on(
      table.studentProfileId
    ),

    uniqueAttempt: unique("assignment_attempts_unique_attempt").on(
      table.assignmentId,
      table.studentProfileId,
      table.attemptNumber
    ),
  })
);
