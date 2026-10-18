"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/server/authorization/requireRole";
import { approveJoinRequest, declineJoinRequest, enrollPaidRequest, JoinError } from "@/src/domains/joining/service";

const idSchema = z.string().uuid();

function done(tab: string, notice: string): never {
  revalidatePath("/dashboard/join-requests");
  revalidatePath("/join");
  redirect(`/dashboard/join-requests?tab=${tab}&notice=${encodeURIComponent(notice)}`);
}

export async function approveAction(formData: FormData) {
  const admin = await requireRole(["admin"]);
  const id = idSchema.parse(formData.get("id"));
  let notice: string;
  try {
    const r = await approveJoinRequest(id, admin.id);
    notice = r.emailSent ? "Approved. Payment link emailed." : "Approved, but the email failed. Check email settings.";
  } catch (err) {
    notice = err instanceof JoinError ? err.message : "Couldn't approve this request.";
  }
  done("pending", notice);
}

export async function declineAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = idSchema.parse(formData.get("id"));
  const reason = String(formData.get("reason") || "").trim().slice(0, 500) || null;
  let notice = "Declined and student informed.";
  try {
    await declineJoinRequest(id, reason);
  } catch (err) {
    notice = err instanceof JoinError ? err.message : "Couldn't decline this request.";
  }
  done(String(formData.get("tab") || "pending"), notice);
}

export async function retryEnrollAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = idSchema.parse(formData.get("id"));
  await enrollPaidRequest(id);
  done("paid", "Tried to set up the account again.");
}
