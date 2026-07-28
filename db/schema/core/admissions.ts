import { pgTable, text, timestamp, varchar, integer, uuid, date } from "drizzle-orm/pg-core";
import { admissionStatusEnum } from "../enums";

export const admissions = pgTable("admissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  class: varchar("class", { length: 50 }).notNull(),
  program: varchar("program", { length: 50 }).notNull(),
  package: varchar("package", { length: 50 }),
  duration: varchar("duration", { length: 50 }),
  price: integer("price"),
  preferredDate: varchar("preferred_date", { length: 20 }),
  preferredTime: varchar("preferred_time", { length: 20 }),
  notes: text("notes"),
  status: admissionStatusEnum("status").default("LEAD").notNull(),
  assignedTeacher: text("assigned_teacher"),
  demoDate: date("demo_date"),
  demoTime: varchar("demo_time", { length: 20 }),
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
