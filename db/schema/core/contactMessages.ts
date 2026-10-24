import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { timestamps } from "../common";

/** Messages sent from the website's contact form. */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    topic: text("topic").notNull(),
    message: text("message").notNull(),
    isHandled: boolean("is_handled").default(false).notNull(),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("contact_messages_created_idx").on(t.createdAt)]
);
