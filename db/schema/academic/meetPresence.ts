import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { classSessions } from "./classSessions";
import { studentProfiles } from "../core/studentProfiles";

/**
 * Each stretch someone spent in a class's Google Meet, read from the Meet API.
 * Rewritten on every sync. studentProfileId is null when we couldn't tell who it was.
 */
export const meetPresence = pgTable(
  "meet_presence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => classSessions.id, { onDelete: "cascade" }),
    studentProfileId: uuid("student_profile_id").references(() => studentProfiles.profileId, { onDelete: "set null" }),
    /** Meet's participant resource name, which groups one person's stretches within a call. */
    participant: text("participant").notNull(),
    displayName: text("display_name"),
    /** "signed_in", "anonymous" or "phone". */
    kind: text("kind").notNull(),
    googleUserId: text("google_user_id"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull(),
    leftAt: timestamp("left_at", { withTimezone: true }),
  },
  (table) => ({
    sessionIdx: index("meet_presence_session_idx").on(table.sessionId),
  })
);
