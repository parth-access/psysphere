"use server";

import { workshopRegistrationSchema, fieldErrors, type FieldErrors } from "@/src/domains/joining/validation";
import { registerForWorkshop, WorkshopError } from "@/src/domains/workshops/service";
import { formAllowed } from "@/server/security/rateLimit";

export type RegisterState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors; message?: string }
  | { status: "done"; alreadyRegistered: boolean; email: string };

export async function registerAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  // Honeypot: real people never fill this hidden field.
  if (formData.get("website")) return { status: "done", alreadyRegistered: false, email: "" };

  const parsed = workshopRegistrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };
  const tooMany = await formAllowed("workshop", parsed.data.email, { perEmail: 5, perIp: 30 });
  if (tooMany) return { status: "error", errors: {}, message: tooMany };

  try {
    const result = await registerForWorkshop(parsed.data);
    return { status: "done", alreadyRegistered: result.alreadyRegistered, email: parsed.data.email };
  } catch (err) {
    if (err instanceof WorkshopError) return { status: "error", errors: {}, message: err.message };
    console.error("[workshop register]", err);
    return { status: "error", errors: {}, message: "Something went wrong. Please try again." };
  }
}
