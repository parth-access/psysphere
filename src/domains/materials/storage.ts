import { createAdminClient } from "../auth/server";
import { MATERIALS_BUCKET } from "./bucket";
import { MATERIAL_TYPES, MAX_MATERIAL_BYTES } from "./limits";

export { MAX_MATERIAL_BYTES };

let bucketChecked = false;

/** Creates the private bucket on first use. */
async function ensureBucket() {
  if (bucketChecked) return;
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(MATERIALS_BUCKET);
  if (!data) {
    const { error } = await admin.storage.createBucket(MATERIALS_BUCKET, { public: false, fileSizeLimit: MAX_MATERIAL_BYTES, allowedMimeTypes: MATERIAL_TYPES });
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

/** A one-time ticket that lets the browser send the file straight to storage (Vercel refuses request bodies over 4.5 MB). */
export async function createMaterialUploadTicket(path: string) {
  await ensureBucket();
  const { data, error } = await createAdminClient().storage.from(MATERIALS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`Could not start the upload: ${error?.message}`);
  return { path: data.path, token: data.token };
}

/** The browser did the uploading, so its word isn't trusted: this reads the size and type from what was actually stored. */
export async function readStoredMaterial(path: string) {
  const res = await fetch(await signedMaterialUrl(path, "check"), { headers: { Range: "bytes=0-0" }, cache: "no-store" });
  if (!res.ok) return null;
  await res.arrayBuffer();
  return {
    bytes: Number(res.headers.get("content-range")?.split("/")[1] ?? res.headers.get("content-length")),
    type: res.headers.get("content-type")?.split(";")[0].trim() ?? "",
  };
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
