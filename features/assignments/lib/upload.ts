import { sendToStorage } from "@/features/shared/lib/sendToStorage";
import { ASSIGNMENT_BUCKET_NAME } from "@/src/domains/assignments/bucket";
import { prepareUploadAction, type UploadRequest } from "@/app/dashboard/assignments/actions";
import { prepareFile, type FileRole, type Picked } from "./compress";

/** Next.js moves between pages by throwing, and that has to carry on past a form's error handling. */
export function rethrowNavigation(err: unknown) {
  if (err && typeof err === "object" && "digest" in err) throw err;
}

export type SentFile = { path: string; name: string; bytes: number; originalBytes: number };

/** Compresses what was picked, asks the server for a ticket, and sends the file straight to storage. */
export async function sendFile(picked: Picked, role: FileRole, target: UploadRequest, onStep: (text: string) => void, onPercent: (percent: number) => void): Promise<SentFile> {
  onStep("Getting your file ready…");
  const ready = await prepareFile(picked, role, onStep);

  onStep("Uploading…");
  const ticket = await prepareUploadAction(target);
  if ("error" in ticket) throw new Error(ticket.error);

  onPercent(0);
  try {
    await sendToStorage({ bucket: ASSIGNMENT_BUCKET_NAME, path: ticket.path, token: ticket.token, file: ready.blob, type: "application/pdf", onPercent });
  } catch {
    throw new Error("The upload didn't go through. Please check your connection and try again.");
  }

  return { path: ticket.path, name: ready.name, bytes: ready.bytes, originalBytes: ready.originalBytes };
}
