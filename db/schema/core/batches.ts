import {
  pgTable,
  uuid,
  text,
  boolean,
  index,
} from "drizzle-orm/pg-core";

import { timestamps, auditColumns } from "../common";

export const batches = pgTable(
  "batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),

    classLevel: text("class_level").notNull(),

    academicYear: text("academic_year").notNull(),

    schedule: text("schedule"),

    isActive: boolean("is_active")
      .default(true)
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
  })
);