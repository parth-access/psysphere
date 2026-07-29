import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const emailDeliveries = pgTable("email_deliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // e.g. "demo_request_received", "demo_approved", etc.
  recipient: varchar("recipient", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 50 }).default("resend").notNull(),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull(), // "success", "failed"
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // "admission"
  relatedEntityId: uuid("related_entity_id"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
