import { classLevelEnum, batchJoinModeEnum } from "../enums";
import {
  pgTable,
  uuid,
  text,
  boolean,
  index,
  integer,
} from "drizzle-orm/pg-core";

import { timestamps, auditColumns } from "../common";
import { profiles } from "./profiles";

export const batches = pgTable(
  "batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),

    classLevel: classLevelEnum("class_level").notNull(),

    academicYear: text("academic_year").notNull(),

    schedule: text("schedule"),

    teacherId: uuid("teacher_id")
      .references(() => profiles.id, {
        onDelete: "set null",
      }),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    /** Max active students. Null means unlimited. */
    capacity: integer("capacity"),

    /** Whether new students can request/join this batch from the website. */
    acceptingStudents: boolean("accepting_students")
      .default(true)
      .notNull(),

    /** "approval": admin approves each request. "open": pay and join instantly. */
    joinMode: batchJoinModeEnum("join_mode")
      .default("approval")
      .notNull(),

    ...timestamps,

    ...auditColumns,
  },
  (table) => ({
    nameIdx: index("batches_name_idx").on(table.name),

    classLevelIdx: index("batches_class_level_idx").on(
      table.classLevel
    ),

    academicYearIdx: index("batches_academic_year_idx").on(
      table.academicYear
    ),

    teacherIdIdx: index("batches_teacher_id_idx").on(
      table.teacherId
    ),
  })
);