import { and, eq, gte, lt, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { batches } from "@/db/schema/core/batches";
import { classSessions } from "@/db/schema/academic/classSessions";
import { attendance } from "@/db/schema/academic/attendance";
import { assignments } from "@/db/schema/academic/assignments";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { evaluations } from "@/db/schema/academic/evaluations";
import { tests, testQuestions, testAttempts } from "@/db/schema/academic/tests";
import { finalizeExpiredFor } from "../tests/service";
import { emailService } from "../email/service";
import { appUrl } from "../joining/tokens";

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", ...o });

/** Emails every active student's parent (or the student) a summary of the past 7 days. */
export async function sendWeeklyReports(now = new Date()) {
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const weekAhead = new Date(now.getTime() + 7 * 86_400_000);
  const weekLabel = `${fmt(weekAgo, { day: "numeric", month: "short" })} – ${fmt(now, { day: "numeric", month: "short" })}`;

  const students = await db
    .select({
      id: profiles.id,
      name: profiles.fullName,
      email: profiles.email,
      parentEmail: studentProfiles.guardianEmail,
      batchId: batches.id,
      batchName: batches.name,
    })
    .from(enrollments)
    .innerJoin(profiles, eq(profiles.id, enrollments.studentProfileId))
    .innerJoin(batches, eq(batches.id, enrollments.batchId))
    .leftJoin(studentProfiles, eq(studentProfiles.profileId, profiles.id))
    .where(and(eq(enrollments.status, "active"), eq(profiles.isActive, true)));

  let sent = 0;
  let failed = 0;
  for (const st of students) {
    try {
      const sessions = await db
        .select({ id: classSessions.id })
        .from(classSessions)
        .where(and(eq(classSessions.batchId, st.batchId), gte(classSessions.startsAt, weekAgo), lt(classSessions.startsAt, now)));
      const att = sessions.length
        ? await db.select({ status: attendance.status }).from(attendance)
            .where(and(eq(attendance.studentProfileId, st.id), inArray(attendance.sessionId, sessions.map((s) => s.id))))
        : [];

      const results = await db
        .select({ title: assignments.title, max: assignments.maxMarks, marks: evaluations.marksObtained, feedback: evaluations.teacherFeedback })
        .from(evaluations)
        .innerJoin(assignmentAttempts, eq(assignmentAttempts.id, evaluations.assignmentAttemptId))
        .innerJoin(assignments, eq(assignments.id, assignmentAttempts.assignmentId))
        .where(and(eq(assignmentAttempts.studentProfileId, st.id), isNotNull(assignments.resultsPublishedAt), gte(assignments.resultsPublishedAt, weekAgo)));

      const open = await db
        .select({ id: assignments.id, title: assignments.title, dueAt: assignments.dueAt })
        .from(assignments)
        .where(and(eq(assignments.batchId, st.batchId), gte(assignments.dueAt, weekAgo), lt(assignments.dueAt, weekAhead)));
      const submitted = open.length
        ? new Set((await db.select({ id: assignmentAttempts.assignmentId }).from(assignmentAttempts)
            .where(and(eq(assignmentAttempts.studentProfileId, st.id), inArray(assignmentAttempts.assignmentId, open.map((o) => o.id))))).map((r) => r.id))
        : new Set<string>();

      const upcoming = await db
        .select({ title: classSessions.title, startsAt: classSessions.startsAt })
        .from(classSessions)
        .where(and(eq(classSessions.batchId, st.batchId), gte(classSessions.startsAt, now), lt(classSessions.startsAt, weekAhead), eq(classSessions.status, "scheduled")))
        .orderBy(classSessions.startsAt)
        .limit(5);

      // Tests that closed this week (marks are only shown once a test closes) and ones opening next week.
      const closedTests = await db
        .select({ id: tests.id, title: tests.title, marksPerCorrect: tests.marksPerCorrect })
        .from(tests)
        .where(and(eq(tests.batchId, st.batchId), isNotNull(tests.publishedAt), gte(tests.closesAt, weekAgo), lt(tests.closesAt, now)));
      await finalizeExpiredFor(closedTests.map((t) => t.id), now);
      const testResults = [];
      for (const t of closedTests) {
        const [a] = await db
          .select({ score: testAttempts.score, total: sql<number>`jsonb_array_length(${testAttempts.questionOrder})` })
          .from(testAttempts)
          .where(and(eq(testAttempts.testId, t.id), eq(testAttempts.studentProfileId, st.id), isNotNull(testAttempts.submittedAt)));
        if (a) {
          testResults.push({ title: `Test: ${t.title}`, marks: Number(a.score), max: Number(a.total) * Number(t.marksPerCorrect), feedback: null });
        } else {
          const [q] = await db.select({ n: sql<number>`count(*)::int` }).from(testQuestions).where(eq(testQuestions.testId, t.id));
          testResults.push({ title: `Test: ${t.title} (not taken)`, marks: 0, max: (q?.n ?? 0) * Number(t.marksPerCorrect), feedback: null });
        }
      }
      const nextTests = await db
        .select({ title: tests.title, opensAt: tests.opensAt })
        .from(tests)
        .where(and(eq(tests.batchId, st.batchId), isNotNull(tests.publishedAt), gte(tests.opensAt, now), lt(tests.opensAt, weekAhead)))
        .orderBy(tests.opensAt);

      const r = await emailService.sendWeeklyReport(
        st.parentEmail || st.email,
        {
          studentName: st.name,
          batchName: st.batchName,
          weekLabel,
          attended: att.filter((a) => a.status === "present").length,
          totalClasses: sessions.length,
          results: [
            ...results.map((x) => ({ title: x.title, marks: Number(x.marks ?? 0), max: Number(x.max), feedback: x.feedback })),
            ...testResults,
          ],
          pendingWork: open.filter((o) => !submitted.has(o.id)).map((o) => ({ title: o.title, dueText: fmt(o.dueAt, { weekday: "short", day: "numeric", month: "short" }) })),
          upcoming: [
            ...upcoming.map((u) => ({ title: u.title, startsAt: u.startsAt })),
            ...nextTests.map((t) => ({ title: `Test: ${t.title}`, startsAt: t.opensAt })),
          ]
            .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
            .map((u) => ({ title: u.title, whenText: fmt(u.startsAt, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) })),
          dashboardUrl: appUrl("/dashboard/student"),
        },
        st.id
      );
      if (r.success) sent++; else failed++;
    } catch (err) {
      failed++;
      console.error(`[weekly report] ${st.id}`, err);
    }
  }
  return { students: students.length, sent, failed };
}
