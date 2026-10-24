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
import { uploadMaterialFile, deleteMaterialFile, MAX_MATERIAL_BYTES } from "@/src/domains/materials/storage";

const ALLOWED = /^(application\/pdf|image\/(png|jpeg|webp)|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation|spreadsheetml\.sheet)|application\/msword|application\/vnd\.ms-powerpoint|text\/plain)$/;

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional().transform((v) => v || null),
  batchId: z.string().uuid().or(z.literal("all")),
});

export async function uploadMaterialAction(formData: FormData) {
  const me = await requireRole(["admin", "teacher"]);
  const v = schema.parse({ title: formData.get("title"), description: formData.get("description"), batchId: formData.get("batchId") });
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) redirect("/dashboard/materials?error=Choose+a+file");
  if (file.size > MAX_MATERIAL_BYTES) redirect("/dashboard/materials?error=Files+must+be+under+20+MB");
  if (!ALLOWED.test(file.type)) redirect("/dashboard/materials?error=Upload+a+PDF,+image,+Word,+PowerPoint,+Excel+or+text+file");

  const batchId = v.batchId === "all" ? null : v.batchId;
  if (batchId ? !(await canManageBatch(me, batchId)) : me.role !== "admin") {
    redirect("/dashboard/materials?error=You+can+only+share+with+your+own+batches");
  }

  const safeName = file.name.replace(/[^\w.\- ]+/g, "_").slice(-120);
  const path = `${batchId ?? "all"}/${crypto.randomUUID()}-${safeName}`;
  await uploadMaterialFile(path, file);
  await db.insert(studyMaterials).values({
    batchId,
    title: v.title,
    description: v.description,
    storagePath: path,
    fileName: safeName,
    mimeType: file.type,
    sizeBytes: file.size,
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
