import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from "../common";

export const googleCredentials = pgTable("google_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").default("google").notNull(),
  accountEmail: text("account_email").notNull().unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  scopes: text("scopes").notNull(),
  ...timestamps,
});
