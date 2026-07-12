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

    role: text("role", {
      enum: ["teacher", "student"],
    }).notNull(),

    fullName: text("full_name").notNull(),

    email: text("email").notNull().unique(),

    avatarUrl: text("avatar_url"),

    isActive: boolean("is_active").default(true).notNull(),

    lastSeenAt: timestamp("last_seen_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    createdBy: uuid("created_by"),

    updatedBy: uuid("updated_by"),
  },
  (table) => ({
    clerkIdx: index("profiles_clerk_idx").on(table.clerkId),

    roleIdx: index("profiles_role_idx").on(table.role),

    emailIdx: index("profiles_email_idx").on(table.email),
  })
);