"use server";

import { redirect } from "next/navigation";
import { joinRequestSchema, fieldErrors, type FieldErrors } from "@/src/domains/joining/validation";
import { createJoinRequest, JoinError } from "@/src/domains/joining/service";

export type JoinState = { status: "idle" } | { status: "error"; errors: FieldErrors; message?: string };

export async function joinAction(_prev: JoinState, formData: FormData): Promise<JoinState> {
  if (formData.get("website")) redirect("/join/requested");

  const parsed = joinRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  let result;
  try {
    result = await createJoinRequest(parsed.data);
  } catch (err) {
    if (err instanceof JoinError) return { status: "error", errors: {}, message: err.message };
    console.error("[join]", err);
    return { status: "error", errors: {}, message: "Something went wrong. Please try again." };
  }

  // redirect() must be outside try/catch
  if (result.kind === "pay") redirect(`/join/pay/${result.payToken}`);
  redirect("/join/requested");
}
