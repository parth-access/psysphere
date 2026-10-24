import { createAdminClient } from "../auth/server";

export const TEST_IMAGES_BUCKET = "test-images";
export const MAX_TEST_IMAGE_BYTES = 3 * 1024 * 1024;
export const TEST_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

let bucketChecked = false;

async function ensureBucket() {
  if (bucketChecked) return;
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(TEST_IMAGES_BUCKET);
  if (!data) {
    const { error } = await admin.storage.createBucket(TEST_IMAGES_BUCKET, {
      public: false,
      fileSizeLimit: MAX_TEST_IMAGE_BYTES,
      allowedMimeTypes: TEST_IMAGE_TYPES,
    });
    if (error && !/already exists/i.test(error.message)) throw new Error(`Could not create storage bucket: ${error.message}`);
  }
  bucketChecked = true;
}

export async function uploadTestImage(path: string, file: File) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Image upload needs Supabase storage. Add the Supabase keys to .env.");
  }
  await ensureBucket();
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(TEST_IMAGES_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
}

/** Signed links for question images, valid long enough to finish a test. Missing images are left out. */
export async function signedTestImageUrls(paths: string[], expiresInSeconds = 4 * 3600): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0 || !process.env.SUPABASE_SERVICE_ROLE_KEY) return {};
  try {
    const admin = createAdminClient();
    const { data } = await admin.storage.from(TEST_IMAGES_BUCKET).createSignedUrls(unique, expiresInSeconds);
    const out: Record<string, string> = {};
    for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
    return out;
  } catch (err) {
    console.error("[tests] could not sign image links", err);
    return {};
  }
}

export async function deleteTestImages(paths: string[]) {
  const list = paths.filter(Boolean);
  if (list.length === 0 || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const admin = createAdminClient();
  await admin.storage.from(TEST_IMAGES_BUCKET).remove(list);
}
