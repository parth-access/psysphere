const MB = 1024 * 1024;

export const MAX_MATERIAL_BYTES = 20 * MB;

const TYPE_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
};

export const MATERIAL_TYPES = [...new Set(Object.values(TYPE_BY_EXTENSION))];
export const MATERIAL_ACCEPT = Object.keys(TYPE_BY_EXTENSION).map((e) => `.${e}`).join(",");

/** The file's type, or null if we don't accept it. Some phones report no type, so the extension is the fallback. */
export function materialTypeOf(name: string, reported: string) {
  if (MATERIAL_TYPES.includes(reported)) return reported;
  return TYPE_BY_EXTENSION[name.split(".").pop()?.toLowerCase() ?? ""] ?? null;
}
