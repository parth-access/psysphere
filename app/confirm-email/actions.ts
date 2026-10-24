"use server";

import { confirmEmailChange } from "@/src/domains/profile/emailChange";

export type ConfirmEmailState = { ok?: string; error?: string };

export async function confirmEmailAction(_p: ConfirmEmailState, formData: FormData): Promise<ConfirmEmailState> {
  const r = await confirmEmailChange(String(formData.get("token") || ""));
  return r.ok ? { ok: r.email } : { error: r.error };
}
