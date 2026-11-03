"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { studyMaterials } from "@/db/schema/academic/studyMaterials";
import { requireRole } from "@/server/authorization/requireRole";
import { canManageBatch } from "@/server/authorization/access";
import { blockedFor, hit, waitText } from "@/server/security/rateLimit";
import { createMaterialUploadTicket, deleteMaterialFile, readStoredMaterial } from "@/src/domains/materials/storage";
import { MATERIAL_TYPES, MAX_MATERIAL_BYTES, materialTypeOf } from "@/src/domains/materials/limits";

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional().transform((v) => v || null),
  batchId: z.string().uuid().or(z.literal("all")),
});

export type MaterialFormState = { error?: string; values?: Record<string, string> };

const TOO_BIG = "Files must be under 20 MB.";
const WRONG_TYPE = "Upload a PDF, image, Word, PowerPoint, Excel or text file.";

const folderFor = (batchId: string | null) => batchId ?? "all";

async function mayShareWith(me: { id: string; role: string }, batchId: string | null) {
  return batchId ? canManageBatch(me, batchId) : me.role === "admin";
}

const uploadRequest = z.object({
  batchId: z.string().uuid().or(z.literal("all")),
  fileName: z.string().min(1).max(500),
  type: z.string().max(200),
  bytes: z.number().int().positive(),
});

/** Checks the person may share here, and only then hands out a ticket for a path the server chose. */
export async function prepareMaterialUploadAction(request: z.infer<typeof uploadRequest>): Promise<{ path: string; token: string; type: string } | { error: string }> {
  const me = await requireRole(["admin", "teacher"]);
  const parsed = uploadRequest.safeParse(request);
  if (!parsed.success) return { error: "Choose a file." };
  const { fileName, bytes } = parsed.data;
  const batchId = parsed.data.batchId === "all" ? null : parsed.data.batchId;

  if (!(await mayShareWith(me, batchId))) return { error: "You can only share with your own batches." };
  if (bytes > MAX_MATERIAL_BYTES) return { error: TOO_BIG };
  const type = materialTypeOf(fileName, parsed.data.type);
  if (!type) return { error: WRONG_TYPE };

  const limit = [{ key: `material-upload:${me.id}`, max: 60, windowMs: 60 * 60_000 }];
  const wait = await blockedFor(limit);
  if (wait > 0) return { error: `That's a lot of uploads. Please try again in ${waitText(wait)}.` };
  await hit(limit);

  const safeName = fileName.replace(/[^\w.\- ]+/g, "_").slice(-120);
  const ticket = await createMaterialUploadTicket(`${folderFor(batchId)}/${crypto.randomUUID()}-${safeName}`);
  return { ...ticket, type };
}

/** Saves a file the browser has already uploaded. If anything's wrong with it, it's removed, and the form sends it again on a retry. */
export async function saveMaterialAction(_prev: MaterialFormState, formData: FormData): Promise<MaterialFormState> {
  const me = await requireRole(["admin", "teacher"]);
  const values = { title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), batchId: String(formData.get("batchId") ?? "") };
  const parsed = schema.safeParse(values);
  const path = String(formData.get("filePath") ?? "");
  const batchId = parsed.success && parsed.data.batchId !== "all" ? parsed.data.batchId : null;
  if (!parsed.success) {
    return { error: "Add a title of at least 2 characters.", values };
  }
  if (!(await mayShareWith(me, batchId))) return { error: "You can only share with your own batches.", values };

  const folder = folderFor(batchId);
  const match = path.startsWith(`${folder}/`) ? path.slice(folder.length + 1).match(/^[0-9a-f-]{36}-([\w.\- ]+)$/) : null;
  if (!match) return { error: "We couldn't find your upload. Please try again.", values };

  const stored = await readStoredMaterial(path);
  const problem = !stored ? "We couldn't find your upload. Please try again." : !stored.bytes || stored.bytes > MAX_MATERIAL_BYTES ? TOO_BIG : !MATERIAL_TYPES.includes(stored.type) ? WRONG_TYPE : null;
  if (problem || !stored) {
    await deleteMaterialFile(path);
    return { error: problem ?? undefined, values };
  }

  await db.insert(studyMaterials).values({
    batchId,
    title: parsed.data.title,
    description: parsed.data.description,
    storagePath: path,
    fileName: match[1],
    mimeType: stored.type,
    sizeBytes: stored.bytes,
    uploadedBy: me.id,
  });
  revalidatePath("/dashboard/materials");
  redirect("/dashboard/materials?uploaded=1");
}

export async function deleteMaterialAction(formData: FormData) {
  const me = await requireRole(["admin", "teacher"]);
  const id = z.string().uuid().parse(formData.get("id"));
  const [m] = await db.select().from(studyMaterials).where(eq(studyMaterials.id, id));
  if (!m) return;
  if (m.batchId ? !(await canManageBatch(me, m.batchId)) : me.role !== "admin") throw new Error("Not allowed");
  await deleteMaterialFile(m.storagePath);
  await db.delete(studyMaterials).where(eq(studyMaterials.id, id));
  revalidatePath("/dashboard/materials");
}
