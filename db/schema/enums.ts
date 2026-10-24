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
 * Workshops & joining
 * ============================================================ */
export const batchJoinModeEnum = pgEnum("batch_join_mode", [
  "approval", // student requests, admin approves, then student pays
  "open", // student pays immediately
]);

export const joinRequestStatusEnum = pgEnum("join_request_status", [
  "pending", // waiting for admin approval
  "approved", // approved, waiting for payment
  "paid", // payment verified, account being provisioned
  "enrolled", // account created and enrolled in batch
  "declined",
  "cancelled",
]);

export const courseTrackEnum = pgEnum("course_track", ["standard", "cuet"]);

export const testSubmitReasonEnum = pgEnum("test_submit_reason", [
  "manual", // student pressed Submit
  "time_up", // their time limit ran out
  "closed", // the test window closed before they submitted
]);

export const testExitReasonEnum = pgEnum("test_exit_reason", [
  "hidden", // switched tab or app, minimised, locked the phone
  "blur", // focus moved to another window
  "fullscreen", // left full screen
]);
