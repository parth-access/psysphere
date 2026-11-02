const GB = 1024 * 1024 * 1024;

export const MAX_RECORDING_BYTES = 2 * GB;
export const RECORDING_HOURS = 24;
export const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "mkv"];

const MIME_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
};

/** The video type for a file name, or null if it isn't a video we accept. */
export function videoTypeOf(fileName: string) {
  return MIME_BY_EXTENSION[fileName.split(".").pop()?.toLowerCase() ?? ""] ?? null;
}

/** The 24 hours end on the clock, whatever has happened to the file in Drive by then. */
export function isWatchable(r: { status: string; expiresAt: Date | null }, now = new Date()) {
  return r.status === "ready" && !!r.expiresAt && r.expiresAt > now;
}

export function timeLeftLabel(expiresAt: Date, now = new Date()) {
  const hours = Math.ceil((expiresAt.getTime() - now.getTime()) / 3_600_000);
  if (hours <= 1) return "less than an hour left";
  return `${hours} hours left`;
}
