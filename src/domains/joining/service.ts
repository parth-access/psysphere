import { db } from "@/db";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { joinRequests } from "@/db/schema/core/joinRequests";
import { and, eq, gt, inArray, or, sql, count } from "drizzle-orm";
import { emailService } from "../email/service";
import { provisionStudent } from "../onboarding/service";
import { findPlan, type ClassLevel, type Track } from "./plans";
import { newPayToken, hashToken, appUrl } from "./tokens";
import { createRazorpayOrder, getRazorpayKeyId } from "@/server/integrations/razorpay";

export class JoinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JoinError";
  }
}

/* ------------------------------------------------------------------ */
/* Batches & seats                                                     */
/* ------------------------------------------------------------------ */

/** Seats taken = active students + approved requests still inside their payment window + paid requests. */
async function seatsTaken(batchId: string): Promise<number> {
  const [enrolled] = await db
    .select({ n: count() })
    .from(enrollments)
    .where(and(eq(enrollments.batchId, batchId), eq(enrollments.status, "active")));
  const [held] = await db
    .select({ n: count() })
    .from(joinRequests)
    .where(
      and(
        eq(joinRequests.batchId, batchId),
        or(
          eq(joinRequests.status, "paid"),
          and(eq(joinRequests.status, "approved"), gt(joinRequests.payTokenExpiresAt, new Date()))
        )
      )
    );
  return Number(enrolled?.n ?? 0) + Number(held?.n ?? 0);
}

export interface JoinableBatch {
  id: string;
  name: string;
  classLevel: ClassLevel;
  academicYear: string;
  schedule: string | null;
  teacherName: string | null;
  joinMode: "approval" | "open";
  capacity: number | null;
  seatsLeft: number | null;
}

export async function listJoinableBatches(): Promise<JoinableBatch[]> {
  const rows = await db
    .select({
      id: batches.id,
      name: batches.name,
      classLevel: batches.classLevel,
      academicYear: batches.academicYear,
      schedule: batches.schedule,
      capacity: batches.capacity,
      joinMode: batches.joinMode,
      teacherName: profiles.fullName,
    })
    .from(batches)
    .leftJoin(profiles, eq(profiles.id, batches.teacherId))
    .where(and(eq(batches.isActive, true), eq(batches.acceptingStudents, true)))
    .orderBy(batches.classLevel, batches.name);

  return Promise.all(
    rows.map(async (b) => ({
      ...b,
      seatsLeft: b.capacity == null ? null : Math.max(0, b.capacity - (await seatsTaken(b.id))),
    }))
  );
}

async function getJoinableBatch(batchId: string) {
  const [batch] = await db.select().from(batches).where(eq(batches.id, batchId)).limit(1);
  if (!batch || !batch.isActive || !batch.acceptingStudents) {
    throw new JoinError("This batch isn't taking new students right now.");
  }
  return batch;
}

async function assertSeatAvailable(batch: { id: string; capacity: number | null }) {
  if (batch.capacity != null && (await seatsTaken(batch.id)) >= batch.capacity) {
    throw new JoinError("Sorry, this batch is full.");
  }
}

/* ------------------------------------------------------------------ */
/* Student creates a request                                           */
/* ------------------------------------------------------------------ */

export interface CreateJoinRequestInput {
  studentName: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  classLevel: ClassLevel;
  track: Track;
  planId: string;
  batchId: string;
  workshopId?: string | null;
}

export type CreateJoinRequestResult =
  | { kind: "pending"; requestId: string }
  | { kind: "pay"; payToken: string };

export async function createJoinRequest(input: CreateJoinRequestInput): Promise<CreateJoinRequestResult> {
  const email = input.email.trim().toLowerCase();
  const plan = findPlan(input.classLevel, input.track, input.planId);
  if (!plan) throw new JoinError("Please choose a valid plan.");

  const batch = await getJoinableBatch(input.batchId);
  if (batch.classLevel !== input.classLevel) {
    throw new JoinError("That batch is for a different class.");
  }

  // Already enrolled in this batch?
  const [already] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .innerJoin(profiles, eq(profiles.id, enrollments.studentProfileId))
    .where(and(eq(profiles.email, email), eq(enrollments.batchId, batch.id), eq(enrollments.status, "active")))
    .limit(1);
  if (already) throw new JoinError("You're already enrolled in this batch. Sign in to see your dashboard.");

  // Reuse an open request for the same batch instead of creating duplicates.
  const [existing] = await db
    .select()
    .from(joinRequests)
    .where(
      and(
        eq(joinRequests.email, email),
        eq(joinRequests.batchId, batch.id),
        inArray(joinRequests.status, ["pending", "approved"])
      )
    )
    .limit(1);

  const details = {
    studentName: input.studentName.trim(),
    phone: input.phone.trim(),
    parentName: input.parentName.trim(),
    parentPhone: input.parentPhone.trim(),
    parentEmail: input.parentEmail || null,
    classLevel: input.classLevel,
    track: input.track,
    planId: plan.id,
    planName: plan.name,
    amountInr: plan.amountInr,
    workshopId: input.workshopId || null,
    updatedAt: new Date(),
  };

  if (batch.joinMode === "open" || existing?.status === "approved") {
    // Pay straight away.
    if (existing?.status !== "approved") await assertSeatAvailable(batch);
    const token = newPayToken();
    const values = {
      ...details,
      status: "approved" as const,
      approvedAt: existing?.approvedAt ?? new Date(),
      payTokenHash: token.hash,
      payTokenExpiresAt: token.expiresAt,
      // plan may have changed, so the old order can't be reused
      razorpayOrderId: null,
    };
    if (existing) {
      await db.update(joinRequests).set(values).where(eq(joinRequests.id, existing.id));
    } else {
      await db.insert(joinRequests).values({ ...values, email, batchId: batch.id });
    }
    return { kind: "pay", payToken: token.raw };
  }

  // Approval needed.
  let requestId = existing?.id;
  if (existing) {
    await db.update(joinRequests).set(details).where(eq(joinRequests.id, existing.id));
  } else {
    const [row] = await db
      .insert(joinRequests)
      .values({ ...details, email, batchId: batch.id, status: "pending" })
      .returning({ id: joinRequests.id });
    requestId = row.id;

    await Promise.allSettled([
      emailService.sendJoinRequestReceived(
        email,
        { studentName: details.studentName, batchName: batch.name, planName: plan.name, amountInr: plan.amountInr },
        requestId
      ),
      emailService.sendNewJoinRequestInternal(
        {
          studentName: details.studentName,
          email,
          phone: details.phone,
          parentName: details.parentName,
          parentPhone: details.parentPhone,
          batchName: batch.name,
          planName: plan.name,
          amountInr: plan.amountInr,
          reviewUrl: appUrl("/dashboard/join-requests"),
        },
        requestId
      ),
    ]);
  }
  return { kind: "pending", requestId: requestId! };
}

/* ------------------------------------------------------------------ */
/* Admin decisions                                                     */
/* ------------------------------------------------------------------ */

export async function approveJoinRequest(id: string, adminId: string) {
  const [req] = await db.select().from(joinRequests).where(eq(joinRequests.id, id)).limit(1);
  if (!req) throw new JoinError("Request not found.");
  if (req.status !== "pending" && req.status !== "approved") {
    throw new JoinError(`This request is already ${req.status}.`);
  }
  const batch = await getJoinableBatch(req.batchId);
  if (req.status === "pending") await assertSeatAvailable(batch);

  const token = newPayToken();
  await db
    .update(joinRequests)
    .set({
      status: "approved",
      approvedAt: new Date(),
      approvedBy: adminId,
      payTokenHash: token.hash,
      payTokenExpiresAt: token.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(joinRequests.id, id));

  const result = await emailService.sendJoinRequestApproved(
    req.email,
    {
      studentName: req.studentName,
      batchName: batch.name,
      planName: req.planName,
      amountInr: req.amountInr,
      payUrl: appUrl(`/join/pay/${token.raw}`),
    },
    id
  );
  return { emailSent: result.success };
}

export async function declineJoinRequest(id: string, reason: string | null) {
  const [req] = await db
    .update(joinRequests)
    .set({ status: "declined", declineReason: reason, payTokenHash: null, updatedAt: new Date() })
    .where(and(eq(joinRequests.id, id), inArray(joinRequests.status, ["pending", "approved"])))
    .returning();
  if (!req) throw new JoinError("Only pending or unpaid requests can be declined.");

  const [batch] = await db.select({ name: batches.name }).from(batches).where(eq(batches.id, req.batchId));
  await emailService.sendJoinRequestDeclined(
    req.email,
    { studentName: req.studentName, batchName: batch?.name ?? "the batch", reason },
    id
  );
}

/* ------------------------------------------------------------------ */
/* Payment                                                             */
/* ------------------------------------------------------------------ */

export async function getRequestByPayToken(rawToken: string) {
  if (!/^[a-f0-9]{64}$/.test(rawToken)) return null;
  const [row] = await db
    .select({ request: joinRequests, batchName: batches.name, schedule: batches.schedule })
    .from(joinRequests)
    .innerJoin(batches, eq(batches.id, joinRequests.batchId))
    .where(eq(joinRequests.payTokenHash, hashToken(rawToken)))
    .limit(1);
  if (!row) return null;
  const expired = !row.request.payTokenExpiresAt || row.request.payTokenExpiresAt < new Date();
  return { ...row, expired };
}

/** Creates (or reuses) the Razorpay order for a payment link. */
export async function createOrderForPayToken(rawToken: string) {
  const found = await getRequestByPayToken(rawToken);
  if (!found) throw new JoinError("This payment link isn't valid.");
  const { request } = found;
  if (request.status === "paid" || request.status === "enrolled") {
    throw new JoinError("This seat is already paid for.");
  }
  if (request.status !== "approved" || found.expired) {
    throw new JoinError("This payment link has expired. Please contact us for a new one.");
  }

  let orderId = request.razorpayOrderId;
  if (!orderId) {
    const order = await createRazorpayOrder({
      amountInr: request.amountInr,
      receipt: `jr_${request.id}`,
      notes: { joinRequestId: request.id, plan: request.planId },
    });
    // Only store if nobody else stored one meanwhile.
    const [updated] = await db
      .update(joinRequests)
      .set({ razorpayOrderId: order.id, updatedAt: new Date() })
      .where(and(eq(joinRequests.id, request.id), sql`${joinRequests.razorpayOrderId} is null`))
      .returning({ orderId: joinRequests.razorpayOrderId });
    if (updated?.orderId) {
      orderId = updated.orderId;
    } else {
      const [again] = await db
        .select({ orderId: joinRequests.razorpayOrderId })
        .from(joinRequests)
        .where(eq(joinRequests.id, request.id));
      orderId = again.orderId;
    }
  }

  return {
    keyId: getRazorpayKeyId(),
    orderId: orderId!,
    amountPaise: request.amountInr * 100,
    description: request.planName,
    prefill: { name: request.studentName, email: request.email, contact: request.phone },
  };
}

/**
 * Called after a verified payment (from Checkout or the webhook).
 * Idempotent: only the first call moves approved -> paid and creates the account.
 */
export async function finalizePaidOrder(orderId: string, paymentId: string) {
  const [claimed] = await db
    .update(joinRequests)
    .set({
      status: "paid",
      razorpayPaymentId: paymentId,
      paidAt: new Date(),
      payTokenHash: null,
      updatedAt: new Date(),
    })
    .where(and(eq(joinRequests.razorpayOrderId, orderId), eq(joinRequests.status, "approved")))
    .returning();

  if (!claimed) {
    const [current] = await db
      .select({ id: joinRequests.id, status: joinRequests.status })
      .from(joinRequests)
      .where(eq(joinRequests.razorpayOrderId, orderId));
    if (!current) throw new JoinError(`No join request for order ${orderId}.`);
    return { requestId: current.id, status: current.status };
  }

  await enrollPaidRequest(claimed.id);
  return { requestId: claimed.id, status: "enrolled" as const };
}

/** Creates the account for a paid request. Admins can retry this if it failed. */
export async function enrollPaidRequest(id: string) {
  const [req] = await db
    .select({ request: joinRequests, batchName: batches.name })
    .from(joinRequests)
    .innerJoin(batches, eq(batches.id, joinRequests.batchId))
    .where(eq(joinRequests.id, id));
  if (!req || req.request.status !== "paid") return;
  const r = req.request;

  try {
    const result = await provisionStudent({
      studentName: r.studentName,
      email: r.email,
      phone: r.phone,
      parentName: r.parentName,
      parentPhone: r.parentPhone,
      parentEmail: r.parentEmail,
      batchId: r.batchId,
    });

    await db
      .update(joinRequests)
      .set({
        status: "enrolled",
        enrolledAt: new Date(),
        studentProfileId: result.userId,
        provisioningError: null,
        updatedAt: new Date(),
      })
      .where(eq(joinRequests.id, id));

    await emailService.sendEnrollmentConfirmed(
      r.email,
      {
        studentName: r.studentName,
        studentId: result.studentId,
        email: r.email,
        batchName: req.batchName,
        planName: r.planName,
        amountInr: r.amountInr,
        paymentId: r.razorpayPaymentId ?? "",
        passwordSetupUrl: result.passwordSetupUrl,
      },
      id
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[joining] Provisioning failed for request ${id}:`, message);
    await db
      .update(joinRequests)
      .set({ provisioningError: message, updatedAt: new Date() })
      .where(eq(joinRequests.id, id));
  }
}
