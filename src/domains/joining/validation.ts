import { z } from "zod";

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+?91)?[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number");

const name = z.string().trim().min(2, "Please enter the full name").max(100);

export const personSchema = z.object({
  studentName: name,
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  phone,
  parentName: name,
  parentPhone: phone,
  classLevel: z.enum(["class_11", "class_12"], { message: "Choose a class" }),
});

export const workshopRegistrationSchema = personSchema.extend({
  workshopId: z.string().uuid(),
});

export const joinRequestSchema = personSchema.extend({
  parentEmail: z.string().trim().toLowerCase().email("Enter a valid parent email").optional().or(z.literal("")).transform((v) => v || null),
  track: z.enum(["standard", "cuet"], { message: "Choose a course" }),
  planId: z.string().min(1, "Choose a plan"),
  batchId: z.string().uuid("Choose a batch"),
  workshopId: z.string().uuid().optional().or(z.literal("")).transform((v) => v || null),
  consent: z.literal("on", { message: "Please confirm a parent agrees" }),
});

export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
