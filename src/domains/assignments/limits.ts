const MB = 1024 * 1024;

export const MAX_ANSWER_BYTES = 10 * MB;
export const MAX_QUESTION_BYTES = 20 * MB;
export const MAX_PHOTOS = 30;

/** Student PDFs bigger than this get compressed. Teacher PDFs only if they're over the limit, to keep print sharp. */
export const COMPRESS_ANSWERS_ABOVE = 3 * MB;

export function formatBytes(bytes: number) {
  if (bytes < MB) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * MB) return `${+(bytes / MB).toFixed(1)} MB`;
  return `${+(bytes / (1024 * MB)).toFixed(1)} GB`;
}
