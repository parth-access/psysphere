import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  index,
  check,
  boolean,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { batches } from "../core/batches";
import { timestamps, auditColumns } from "../common";

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, {
        onDelete: "cascade",
      }),

    title: text("title").notNull(),

    /** The pasted questions. Empty when the teacher only uploaded a PDF. */
    instructions: text("instructions").notNull(),

    /** The uploaded question paper, in the private assignment-files bucket. */
    questionFilePath: text("question_file_path"),
    questionFileName: text("question_file_name"),
    questionFileBytes: integer("question_file_bytes"),

    /** Off: nothing can be submitted after the due date. */
    allowLate: boolean("allow_late").default(true).notNull(),

    publishedAt: timestamp("published_at", {
      withTimezone: true,
    }),

    resultsPublishedAt: timestamp("results_published_at", {
      withTimezone: true,
    }),

    dueAt: timestamp("due_at", {
      withTimezone: true,
    }).notNull(),

    maxMarks: numeric("max_marks", { precision: 5, scale: 2 }).notNull(),

    maxAttempts: integer("max_attempts")
      .default(1)
      .notNull(),

    ...timestamps,

    ...auditColumns,
  },
  (table) => [
    index("assignments_batch_idx").on(table.batchId),
    index("assignments_published_idx").on(table.publishedAt),
    index("assignments_due_idx").on(table.dueAt),
    index("assignments_results_published_idx").on(table.resultsPublishedAt),
    check("assignments_max_attempts_check", sql`${table.maxAttempts} > 0`),
  ]
);
