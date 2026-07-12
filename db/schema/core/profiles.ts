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
    id: uuid("id").defaultRandom().primaryKey(),

    clerkId: text("clerk_id").notNull().unique(),

    role: roleEnum("role").notNull(),

    fullName: text("full_name").notNull(),

    email: text("email").notNull().unique(),

    avatarUrl: text("avatar_url"),

    isActive: boolean("is_active").default(true).notNull(),

    lastSeenAt: timestamp("last_seen_at", {
      withTimezone: true,
    }),

    ...timestamps,

    ...auditColumns,
  },
  (table) => ({
    clerkIdx: index("profiles_clerk_idx").on(table.clerkId),

    roleIdx: index("profiles_role_idx").on(table.role),

    emailIdx: index("profiles_email_idx").on(table.email),
  })
);