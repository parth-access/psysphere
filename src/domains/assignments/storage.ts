import crypto from "crypto";
import { createAdminClient } from "../auth/server";
import { ASSIGNMENT_BUCKET_NAME as ASSIGNMENT_BUCKET } from "./bucket";
import { MAX_QUESTION_BYTES } from "./limits";

/*
 * Every assignment file lives here. To move to another storage provider, this file is the part to change
 * (the browser's upload step in features/assignments/lib/upload.ts goes with it).
 */

let bucketChecked = false;

/** Creates the private bucket on first use. */
async function ensureBucket() {
  if (bucketChecked) return;
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(ASSIGNMENT_BUCKET);
  if (!data) {
    const { error } = await admin.storage.createBucket(ASSIGNMENT_BUCKET, {
      public: false,
      fileSizeLimit: MAX_QUESTION_BYTES,
      allowedMimeTypes: ["application/pdf"],
    });
    if (error && !/already exists/i.test(error.message)) throw new Error(`Could not create storage bucket: ${error.message}`);
  }
  bucketChecked = true;
}

export const newFilePath = (folder: string) => `${folder}/${crypto.randomUUID()}.pdf`;

/** A one-time ticket that lets the browser send the file straight to storage (Vercel refuses request bodies over 4.5 MB). */
export async function createUploadTicket(path: string) {
  await ensureBucket();
  const { data, error } = await createAdminClient().storage.from(ASSIGNMENT_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`Could not start the upload: ${error?.message}`);
  return { path: data.path, token: data.token };
}

export async function signedFileUrl(path: string, fileName: string, opts: { download?: boolean } = {}) {
  const { data, error } = await createAdminClient()
    .storage.from(ASSIGNMENT_BUCKET)
    .createSignedUrl(path, 60, opts.download ? { download: fileName } : undefined);
  if (error || !data) throw new Error(`Could not create file link: ${error?.message}`);
  return data.signedUrl;
}

/**
 * The browser did the uploading, so nothing it says about the file is trusted. Reads the start of the stored file:
 * returns its real size if it's a PDF within the limit, or a message to show. A file that fails is removed.
 */
export async function checkUploadedFile(path: string, maxBytes: number): Promise<{ bytes: number } | { error: string }> {
  const res = await fetch(await signedFileUrl(path, "check.pdf"), { headers: { Range: "bytes=0-4" }, cache: "no-store" });
  if (!res.ok) return { error: "We couldn't find your upload. Please try again." };
  const bytes = Number(res.headers.get("content-range")?.split("/")[1] ?? res.headers.get("content-length"));
  const start = new TextDecoder().decode((await res.arrayBuffer()).slice(0, 5));
  if (start !== "%PDF-") {
    await deleteFiles([path]);
    return { error: "That file isn't a real PDF. Please try another." };
  }
  if (!bytes || bytes > maxBytes) {
    await deleteFiles([path]);
    return { error: `Files can be up to ${Math.round(maxBytes / (1024 * 1024))} MB.` };
  }
  return { bytes };
}

export async function deleteFiles(paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => !!p);
  if (list.length === 0) return;
  const { error } = await createAdminClient().storage.from(ASSIGNMENT_BUCKET).remove(list);
  if (error) console.error("[assignments] could not remove files:", error.message);
}
