import crypto from "crypto";
import { createAdminClient } from "../auth/server";

export const AVATARS_BUCKET = "avatars";
// The browser shrinks photos to 512px before upload, so real files are tiny; this only stops abuse.
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

let bucketChecked = false;

/** Creates the private bucket on first use. Photos are only served through /api/avatars to signed-in users. */
async function ensureBucket() {
  if (bucketChecked) return;
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(AVATARS_BUCKET);
  if (!data) {
    const { error } = await admin.storage.createBucket(AVATARS_BUCKET, {
      public: false,
      fileSizeLimit: MAX_AVATAR_BYTES,
      allowedMimeTypes: AVATAR_TYPES,
    });
    if (error && !/already exists/i.test(error.message)) throw new Error(`Could not create storage bucket: ${error.message}`);
  }
  bucketChecked = true;
}

/** Stores a new photo under a fresh name (so cached copies of the old one never show) and returns its path. */
export async function uploadAvatar(profileId: string, file: File) {
  await ensureBucket();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${profileId}/${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(AVATARS_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);
  return path;
}

export async function signedAvatarUrl(path: string, expiresInSeconds = 3600) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(AVATARS_BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) throw new Error(`Could not sign photo link: ${error?.message}`);
  return data.signedUrl;
}

export async function deleteAvatar(path: string | null | undefined) {
  if (!path) return;
  try {
    await createAdminClient().storage.from(AVATARS_BUCKET).remove([path]);
  } catch (err) {
    console.error("[avatars] could not delete old photo", err);
  }
}
