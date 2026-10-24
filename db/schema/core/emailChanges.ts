import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

/** A requested change of login email, waiting for the link sent to the new address. Only the token's hash is stored. */
export const emailChanges = pgTable(
  "email_changes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    newEmail: text("new_email").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    profileIdx: index("email_changes_profile_idx").on(table.profileId),
  })
);
