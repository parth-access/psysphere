import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { admissions } from "./admissions";

export const prospectTokens = pgTable(
  "prospect_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    admissionId: uuid("admission_id")
      .notNull()
      .references(() => admissions.id, { onDelete: "cascade" }),

    tokenHash: varchar("token_hash", { length: 255 }).notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    admissionIdx: index("prospect_tokens_admission_idx").on(
      table.admissionId
    ),

    tokenHashIdx: index("prospect_tokens_hash_idx").on(
      table.tokenHash
    ),
  })
);