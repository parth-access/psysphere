import { pgEnum } from "drizzle-orm/pg-core";

/* ============================================================
 * Identity
 * ============================================================ */

export const roleEnum = pgEnum("role", [
  "admin",
  "teacher",
  "student",
]);

/* ============================================================
 * Academic
 * ============================================================ */

export const classLevelEnum = pgEnum("class_level", [
  "class_11",
  "class_12",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "completed",
  "dropped",
]);

export const classSessionStatusEnum = pgEnum("class_session_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "excused",
]);

export const assignmentAttemptStatusEnum = pgEnum(
  "assignment_attempt_status",
  [
    "draft",
    "submitted",
    "resubmitted",
  ]
);

/* ============================================================
 * Communication
 * ============================================================ */

export const announcementTargetEnum = pgEnum(
  "announcement_target",
  [
    "all",
    "batch",
    "class_level",
  ]
);

export const priorityEnum = pgEnum("priority", [
  "low",
  "normal",
  "high",
]);

/* ============================================================
 * Marketing
 * ============================================================ */

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_demo",
  "demo_scheduled",
  "demo_completed",
  "converted",
  "cancelled",
]);