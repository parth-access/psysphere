import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { assignmentAttempts } from "./assignmentAttempts";
import { profiles } from "../core/profiles";
import { timestamps } from "../common";

export const evaluations = pgTable(
  "evaluations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    assignmentAttemptId: uuid("assignment_attempt_id")
      .notNull()
      .references(() => assignmentAttempts.id, {
        onDelete: "cascade",
      }),

    marksObtained: numeric("marks_obtained", { precision: 5, scale: 2 }),

    teacherFeedback: text("teacher_feedback"),

    /** The copy the teacher checked and sent back, in the private assignment-files bucket. */
    checkedFilePath: text("checked_file_path"),
    checkedFileName: text("checked_file_name"),
    checkedFileBytes: integer("checked_file_bytes"),

    evaluatedBy: uuid("evaluated_by")
      .references(() => profiles.id, {
        onDelete: "set null",
      }),

    evaluatedAt: timestamp("evaluated_at", {
      withTimezone: true,
    }),

    ...timestamps,
  },
  (table) => ({
    attemptIdx: index("evaluations_attempt_idx").on(
      table.assignmentAttemptId
    ),

    evaluatorIdx: index("evaluations_evaluator_idx").on(
      table.evaluatedBy
    ),

    uniqueEvaluation: unique("evaluations_unique_attempt").on(
      table.assignmentAttemptId
    ),
  })
);
