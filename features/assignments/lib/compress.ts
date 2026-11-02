import { COMPRESS_ANSWERS_ABOVE, MAX_ANSWER_BYTES, MAX_QUESTION_BYTES, formatBytes } from "@/src/domains/assignments/limits";

/** What the person picked: one PDF, or photos of their pages to turn into one. */
export type Picked = { kind: "pdf"; file: File } | { kind: "photos"; files: File[] };

export type ReadyFile = { blob: Blob; name: string; bytes: number; originalBytes: number };

export type FileRole = "answer" | "question" | "checked";

const limits: Record<FileRole, { max: number; compressAbove: number }> = {
  answer: { max: MAX_ANSWER_BYTES, compressAbove: COMPRESS_ANSWERS_ABOVE },
  checked: { max: MAX_ANSWER_BYTES, compressAbove: COMPRESS_ANSWERS_ABOVE },
  question: { max: MAX_QUESTION_BYTES, compressAbove: MAX_QUESTION_BYTES },
};

/** Tried in order until the result fits: the first is sharp enough for handwriting, the rest give up detail for size. */
const PHOTO_PASSES = [
  { longEdge: 1600, quality: 0.7 },
  { longEdge: 1280, quality: 0.55 },
  { longEdge: 1000, quality: 0.45 },
];

const A4_WIDTH = 595;

function toJpeg(source: CanvasImageSource, width: number, height: number, quality: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this file.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise<ArrayBuffer>((resolve, reject) => {
    canvas.toBlob((b) => (b ? b.arrayBuffer().then(resolve, reject) : reject(new Error("Your browser couldn't process this file."))), "image/jpeg", quality);
  });
}

async function photosToPdf(files: File[], pass: (typeof PHOTO_PASSES)[number], onPage: (n: number) => void) {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  for (const [i, file] of files.entries()) {
    onPage(i + 1);
    // One photo at a time, so a phone doesn't run out of memory on a long answer.
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error(`We couldn't read ${file.name}. Please use a JPG or PNG photo.`);
    }
    const scale = Math.min(1, pass.longEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const jpeg = await toJpeg(bitmap, width, height, pass.quality);
    bitmap.close();
    const image = await pdf.embedJpg(jpeg);
    const page = pdf.addPage([A4_WIDTH, (A4_WIDTH * height) / width]);
    page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  }
  return new Blob([(await pdf.save()) as BlobPart], { type: "application/pdf" });
}

/**
 * Redraws each page as a compressed image, at about 150 dpi. This shrinks scans a lot but can grow PDFs that are
 * mostly text, so the caller only keeps the result if it's smaller. Returns null if the PDF can't be read here
 * (password-protected, or an older browser).
 */
async function shrinkPdf(file: File, onPage: (n: number, total: number) => void) {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    const source = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const { PDFDocument } = await import("pdf-lib");
    const out = await PDFDocument.create();
    for (let n = 1; n <= source.numPages; n++) {
      onPage(n, source.numPages);
      const page = await source.getPage(n);
      const size = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: 1240 / Math.max(size.width, 1) });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const image = await out.embedJpg(await toJpeg(canvas, canvas.width, canvas.height, 0.6));
      out.addPage([size.width, size.height]).drawImage(image, { x: 0, y: 0, width: size.width, height: size.height });
      page.cleanup();
    }
    await source.destroy();
    return new Blob([(await out.save()) as BlobPart], { type: "application/pdf" });
  } catch (err) {
    console.warn("[compress] keeping the original PDF:", err);
    return null;
  }
}

const baseName = (name: string) => name.replace(/\.[^.]+$/, "").replace(/[^\w\- ]+/g, "_").trim().slice(0, 100) || "answer";

/** Turns what was picked into one PDF within the limit for this kind of file, or throws a message to show. */
export async function prepareFile(picked: Picked, role: FileRole, onStep: (text: string) => void): Promise<ReadyFile> {
  const { max, compressAbove } = limits[role];
  const tooBig = `This is still too big after compressing. Files can be up to ${formatBytes(max)}, so try fewer or clearer pages.`;

  if (picked.kind === "photos") {
    const originalBytes = picked.files.reduce((sum, f) => sum + f.size, 0);
    const total = picked.files.length;
    for (const pass of PHOTO_PASSES) {
      const blob = await photosToPdf(picked.files, pass, (n) => onStep(`Compressing photo ${n} of ${total}…`));
      if (blob.size <= max) return { blob, name: `${baseName(picked.files[0].name)}.pdf`, bytes: blob.size, originalBytes };
    }
    throw new Error(tooBig);
  }

  const { file } = picked;
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) throw new Error("Please choose a PDF file.");
  const name = `${baseName(file.name)}.pdf`;
  const pdf = file.slice(0, file.size, "application/pdf");
  if (file.size <= compressAbove) return { blob: pdf, name, bytes: file.size, originalBytes: file.size };

  const smaller = await shrinkPdf(file, (n, total) => onStep(`Compressing page ${n} of ${total}…`));
  const best = smaller && smaller.size < file.size ? smaller : pdf;
  if (best.size > max) throw new Error(tooBig);
  return { blob: best, name, bytes: best.size, originalBytes: file.size };
}
