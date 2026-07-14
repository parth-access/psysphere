import { timestamps } from "../system/common";
import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import { profiles } from "./profiles";

export const studentProfiles = pgTable(
  "student_profiles",
  {
    profileId: uuid("profile_id")
      .primaryKey()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),

    admissionNumber: text("admission_number").unique(),

    enrollmentDate: date("enrollment_date"),

    guardianName: text("guardian_name"),

    guardianEmail: text("guardian_email"),

    guardianPhone: text("guardian_phone"),

    notes: text("notes"),

    ...timestamps,
  },
  (table) => ({
    admissionIdx: index("student_profiles_admission_idx").on(
      table.admissionNumber
    ),
  })
);