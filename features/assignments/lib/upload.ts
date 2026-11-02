import { createClient } from "@/src/domains/auth/client";
import { ASSIGNMENT_BUCKET_NAME } from "@/src/domains/assignments/bucket";
import { prepareUploadAction, type UploadRequest } from "@/app/dashboard/assignments/actions";
import { prepareFile, type FileRole, type Picked } from "./compress";

/** Next.js moves between pages by throwing, and that has to carry on past a form's error handling. */
export function rethrowNavigation(err: unknown) {
  if (err && typeof err === "object" && "digest" in err) throw err;
}

export type SentFile = { path: string; name: string; bytes: number; originalBytes: number };

/** Compresses what was picked, asks the server for a ticket, and sends the file straight to storage. */
export async function sendFile(picked: Picked, role: FileRole, target: UploadRequest, onStep: (text: string) => void): Promise<SentFile> {
  onStep("Getting your file ready…");
  const ready = await prepareFile(picked, role, onStep);

  onStep("Uploading…");
  const ticket = await prepareUploadAction(target);
  if ("error" in ticket) throw new Error(ticket.error);

  const { error } = await createClient()
    .storage.from(ASSIGNMENT_BUCKET_NAME)
    .uploadToSignedUrl(ticket.path, ticket.token, await ready.blob.arrayBuffer(), { contentType: "application/pdf" });
  if (error) throw new Error("The upload didn't go through. Please check your connection and try again.");

  return { path: ticket.path, name: ready.name, bytes: ready.bytes, originalBytes: ready.originalBytes };
}
