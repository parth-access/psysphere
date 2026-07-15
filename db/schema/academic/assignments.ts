import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  index,
  check,
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

    instructions: text("instructions").notNull(),

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
