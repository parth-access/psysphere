import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import {
  classLevelEnum,
  courseTrackEnum,
  joinRequestStatusEnum,
} from "../enums";
import { timestamps } from "../common";
import { batches } from "./batches";
import { profiles } from "./profiles";
import { workshops } from "./workshops";

/**
 * A student's request to join a batch, and the payment that goes with it.
 *
 * pending -> approved -> paid -> enrolled
 * (open batches skip "pending" and are created as "approved")
 */
export const joinRequests = pgTable(
  "join_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    studentName: text("student_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    parentName: text("parent_name").notNull(),
    parentPhone: text("parent_phone").notNull(),
    /** Where weekly progress reports go. Optional. */
    parentEmail: text("parent_email"),

    classLevel: classLevelEnum("class_level").notNull(),
    track: courseTrackEnum("track").notNull(),
    /** Plan id from constants/pricing.ts, e.g. "11-std-quarterly". */
    planId: text("plan_id").notNull(),
    planName: text("plan_name").notNull(),
    /** Price snapshot in rupees at the time of the request. */
    amountInr: integer("amount_inr").notNull(),

    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "restrict" }),

    /** Workshop that brought the student in, if any. */
    workshopId: uuid("workshop_id").references(() => workshops.id, {
      onDelete: "set null",
    }),

    status: joinRequestStatusEnum("status").default("pending").notNull(),

    /** SHA-256 hash of the secret payment-link token. Raw token is only emailed. */
    payTokenHash: text("pay_token_hash"),
    payTokenExpiresAt: timestamp("pay_token_expires_at", { withTimezone: true }),

    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),

    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }),
    studentProfileId: uuid("student_profile_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    declineReason: text("decline_reason"),
    provisioningError: text("provisioning_error"),

    ...timestamps,
  },
  (table) => [
    index("join_requests_status_idx").on(table.status),
    index("join_requests_email_idx").on(table.email),
    index("join_requests_batch_idx").on(table.batchId),
    uniqueIndex("join_requests_pay_token_hash_unique").on(table.payTokenHash),
    uniqueIndex("join_requests_razorpay_order_unique").on(table.razorpayOrderId),
  ]
);
