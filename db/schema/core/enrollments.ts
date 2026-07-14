import {
  pgTable,
  uuid,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

import { studentProfiles } from "./studentProfiles";
import { batches } from "./batches";

import { timestamps } from "../system/common";
import { enrollmentStatusEnum } from "../system/enums";

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    studentProfileId: uuid("student_profile_id")
      .notNull()
      .references(() => studentProfiles.profileId, {
        onDelete: "cascade",
      }),

    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, {
        onDelete: "cascade",
      }),

    status: enrollmentStatusEnum("status")
      .default("active")
      .notNull(),

    enrolledAt: timestamp("enrolled_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    leftAt: timestamp("left_at", {
      withTimezone: true,
    }),

    ...timestamps,
  },
  (table) => ({
    studentIdx: index("enrollments_student_idx").on(
      table.studentProfileId
    ),

    batchIdx: index("enrollments_batch_idx").on(
      table.batchId
    ),

    uniqueEnrollment: unique("enrollments_student_batch_unique").on(
      table.studentProfileId,
      table.batchId
    ),
  })
);