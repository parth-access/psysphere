import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/** Fixed-window counters for login and password-reset attempts, keyed like "login:email:x@y.com". */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull().defaultNow(),
});
