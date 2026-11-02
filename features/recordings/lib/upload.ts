import { finishRecordingUploadAction, startRecordingUploadAction } from "@/app/dashboard/recordings/actions";

/** Drive needs pieces in multiples of 256 KB. A dropped connection only loses the piece being sent. */
const PIECE_BYTES = 32 * 256 * 1024;
const MAX_TRIES = 6;

export type Progress = { sent: number; total: number };

/** Remembers where an upload can carry on, so choosing the same file after a refresh doesn't start again. */
function savedKey(sessionId: string, file: File) {
  return `recording-upload:${sessionId}:${file.name}:${file.size}:${file.lastModified}`;
}
function readSaved(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function save(key: string, value: string | null) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {}
}

class UploadGone extends Error {}

const nextByte = (res: Response) => {
  const m = res.headers.get("range")?.match(/bytes=0-(\d+)/);
  return m ? Number(m[1]) + 1 : 0;
};

/** How much of the file Drive already has, or the file's ID if it has it all. */
async function askPosition(uploadUrl: string, total: number, signal: AbortSignal): Promise<number | { id: string }> {
  const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Range": `bytes */${total}` }, signal });
  if (res.status === 308) return nextByte(res);
  if (res.ok) return { id: (await res.json()).id };
  if (res.status === 404 || res.status === 410) throw new UploadGone();
  throw new Error(`Drive replied ${res.status}`);
}

async function sendPieces(uploadUrl: string, file: File, resuming: boolean, onProgress: (p: Progress) => void, signal: AbortSignal) {
  const total = file.size;
  let at = 0;
  if (resuming) {
    const position = await askPosition(uploadUrl, total, signal);
    if (typeof position !== "number") return position.id;
    at = position;
  }
  let tries = 0;
  while (true) {
    onProgress({ sent: at, total });
    const end = Math.min(at + PIECE_BYTES, total);
    try {
      const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Range": `bytes ${at}-${end - 1}/${total}` }, body: file.slice(at, end), signal });
      if (res.ok) return (await res.json()).id as string;
      if (res.status === 404 || res.status === 410) throw new UploadGone();
      if (res.status === 308) {
        at = nextByte(res);
        tries = 0;
        continue;
      }
      if (res.status < 500 && res.status !== 429) throw new Error(`Drive replied ${res.status}`);
    } catch (err) {
      if (err instanceof UploadGone || signal.aborted) throw err;
      if (err instanceof Error && err.message.startsWith("Drive replied")) throw err;
    }
    if (++tries >= MAX_TRIES) throw new Error("connection");
    await new Promise((r) => setTimeout(r, 2 ** tries * 1000));
    const position = await askPosition(uploadUrl, total, signal).catch((err) => {
      if (err instanceof UploadGone || signal.aborted) throw err;
      return at;
    });
    if (typeof position !== "number") return position.id;
    at = position;
  }
}

/** Sends the video to Drive and saves it against the class. Throws a message to show if it can't. */
export async function uploadRecording(sessionId: string, file: File, onProgress: (p: Progress) => void, signal: AbortSignal) {
  const key = savedKey(sessionId, file);
  let uploadUrl = readSaved(key);
  let resuming = !!uploadUrl;
  let driveFileId: string | null = null;

  for (let attempt = 0; !driveFileId; attempt++) {
    if (!uploadUrl) {
      const started = await startRecordingUploadAction({ sessionId, fileName: file.name, bytes: file.size });
      if ("error" in started) throw new Error(started.error);
      uploadUrl = started.uploadUrl;
      resuming = false;
      save(key, uploadUrl);
    }
    try {
      driveFileId = await sendPieces(uploadUrl, file, resuming, onProgress, signal);
    } catch (err) {
      const refused = err instanceof UploadGone || (err instanceof Error && err.message.startsWith("Drive replied"));
      save(key, refused ? null : uploadUrl);
      if (err instanceof UploadGone && attempt === 0) {
        uploadUrl = null;
        continue;
      }
      if (signal.aborted) throw err;
      throw new Error("The connection dropped. Choose the same file again and it will carry on from where it stopped.");
    }
  }

  save(key, null);
  onProgress({ sent: file.size, total: file.size });
  const finished = await finishRecordingUploadAction({ sessionId, driveFileId, fileName: file.name });
  if ("error" in finished) throw new Error(finished.error);
}
