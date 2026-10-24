import { sql } from "drizzle-orm";
import { pgTable, uuid, text, integer, numeric, boolean, timestamp, jsonb, index, unique, check } from "drizzle-orm/pg-core";
import { batches } from "../core/batches";
import { profiles } from "../core/profiles";
import { timestamps, auditColumns } from "../common";
import { testExitReasonEnum, testSubmitReasonEnum } from "../enums";

export type TestOption = { id: string; text: string };

/** A timed MCQ test for one batch. Draft until publishedAt is set. */
export const tests = pgTable(
  "tests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    instructions: text("instructions"),
    /** Students can start between opensAt and closesAt. Scores and answers unlock at closesAt. */
    opensAt: timestamp("opens_at", { withTimezone: true }).notNull(),
    closesAt: timestamp("closes_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    marksPerCorrect: numeric("marks_per_correct", { precision: 5, scale: 2 }).default("1").notNull(),
    /** Marks taken away for a wrong answer. Skipped questions lose nothing. */
    penaltyPerWrong: numeric("penalty_per_wrong", { precision: 5, scale: 2 }).default("0").notNull(),
    /** XP ignores penalties, so students get a rough idea of how they did before scores unlock. */
    xpPerCorrect: integer("xp_per_correct").default(2).notNull(),
    shuffle: boolean("shuffle").default(true).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
    ...auditColumns,
  },
  (t) => [
    index("tests_batch_idx").on(t.batchId),
    index("tests_closes_at_idx").on(t.closesAt),
    check("tests_window_check", sql`${t.closesAt} > ${t.opensAt}`),
    check("tests_duration_check", sql`${t.durationMinutes} > 0`),
  ]
);

export const testQuestions = pgTable(
  "test_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull().references(() => tests.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    prompt: text("prompt").notNull(),
    /** Path in the private "test-images" storage bucket. */
    imagePath: text("image_path"),
    options: jsonb("options").$type<TestOption[]>().notNull(),
    correctOptionId: text("correct_option_id").notNull(),
    explanation: text("explanation"),
    ...timestamps,
  },
  (t) => [index("test_questions_test_idx").on(t.testId, t.position)]
);

/** One per student per test. The server owns the clock: answers after endsAt are refused. */
export const testAttempts = pgTable(
  "test_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id").notNull().references(() => tests.id, { onDelete: "cascade" }),
    studentProfileId: uuid("student_profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    /** Earlier of start + time limit and the test closing. */
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    submitReason: testSubmitReasonEnum("submit_reason"),
    /** This student's question order, and option order per question. */
    questionOrder: jsonb("question_order").$type<string[]>().notNull(),
    optionOrder: jsonb("option_order").$type<Record<string, string[]>>().notNull(),
    /** questionId -> chosen option id */
    answers: jsonb("answers").$type<Record<string, string>>().default({}).notNull(),
    markedForReview: jsonb("marked_for_review").$type<string[]>().default([]).notNull(),
    visited: jsonb("visited").$type<string[]>().default([]).notNull(),
    exitCount: integer("exit_count").default(0).notNull(),
    correctCount: integer("correct_count"),
    wrongCount: integer("wrong_count"),
    score: numeric("score", { precision: 7, scale: 2 }),
    xp: integer("xp"),
    ...timestamps,
  },
  (t) => [
    unique("test_attempts_test_student_unique").on(t.testId, t.studentProfileId),
    index("test_attempts_student_idx").on(t.studentProfileId),
  ]
);

/** Each time a student leaves the test screen. Times are the server's, not the device's. */
export const testAttemptExits = pgTable(
  "test_attempt_exits",
  {
    /** Made on the device so the "returned" message can find its "left" row. */
    id: uuid("id").primaryKey(),
    attemptId: uuid("attempt_id").notNull().references(() => testAttempts.id, { onDelete: "cascade" }),
    reason: testExitReasonEnum("reason").notNull(),
    leftAt: timestamp("left_at", { withTimezone: true }).defaultNow().notNull(),
    returnedAt: timestamp("returned_at", { withTimezone: true }),
    /** Which question was on screen when they left. */
    questionId: uuid("question_id"),
  },
  (t) => [index("test_attempt_exits_attempt_idx").on(t.attemptId, t.leftAt)]
);
