import { createAdminClient } from "../auth/server";

export const MATERIALS_BUCKET = "study-materials";
export const MAX_MATERIAL_BYTES = 20 * 1024 * 1024;

let bucketChecked = false;

/** Creates the private bucket on first use. */
async function ensureBucket() {
  if (bucketChecked) return;
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(MATERIALS_BUCKET);
  if (!data) {
    const { error } = await admin.storage.createBucket(MATERIALS_BUCKET, { public: false, fileSizeLimit: MAX_MATERIAL_BYTES });
    if (error && !/already exists/i.test(error.message)) throw new Error(`Could not create storage bucket: ${error.message}`);
  }
  bucketChecked = true;
}

export async function uploadMaterialFile(path: string, file: File) {
  await ensureBucket();
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(MATERIALS_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || "application/octet-stream", upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
}

export async function signedMaterialUrl(path: string, fileName: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(MATERIALS_BUCKET).createSignedUrl(path, 60, { download: fileName });
  if (error || !data) throw new Error(`Could not create download link: ${error?.message}`);
  return data.signedUrl;
}

export async function deleteMaterialFile(path: string) {
  const admin = createAdminClient();
  await admin.storage.from(MATERIALS_BUCKET).remove([path]);
}
