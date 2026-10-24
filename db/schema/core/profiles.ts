import { roleEnum } from "../enums";
import { timestamps, auditColumns } from "../common";
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),

    role: roleEnum("role").notNull(),

    fullName: text("full_name").notNull(),

    email: text("email").notNull().unique(),

    /** Path of the profile photo in the private "avatars" storage bucket (not a URL). */
    avatarUrl: text("avatar_url"),

    phone: text("phone"),

    isActive: boolean("is_active").default(true).notNull(),

    lastSeenAt: timestamp("last_seen_at", {
      withTimezone: true,
    }),

    ...timestamps,

    ...auditColumns,
  },
  (table) => ({
    roleIdx: index("profiles_role_idx").on(table.role),

    emailIdx: index("profiles_email_idx").on(table.email),
  })
);