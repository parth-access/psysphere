import { pgTable, text, timestamp, varchar, integer, uuid } from "drizzle-orm/pg-core";
import { bookingStatusEnum } from "../enums";

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  class: varchar("class", { length: 50 }).notNull(),
  package: varchar("package", { length: 50 }).notNull(),
  duration: varchar("duration", { length: 50 }).notNull(),
  price: integer("price").notNull(),
  preferredDate: varchar("preferred_date", { length: 20 }).notNull(),
  preferredTime: varchar("preferred_time", { length: 20 }).notNull(),
  notes: text("notes"),
  status: bookingStatusEnum("status").default("pending_demo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
