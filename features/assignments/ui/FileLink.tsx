import { FileText } from "lucide-react";
import { formatBytes } from "@/src/domains/assignments/limits";
import { PdfPreview } from "./PdfPreview";

export type FileRef = { kind: "question" | "answer" | "checked"; id: string; name: string | null; bytes: number | null };

export const fileHref = (f: Pick<FileRef, "kind" | "id">) => `/api/assignments/files/${f.kind}/${f.id}`;

/** A protected file: open or save it, and on a big screen read it in place. Phones often can't show a PDF inside a page, so they just open it. */
export function FileLink({ file, label, preview }: { file: FileRef; label?: string; preview?: boolean }) {
  const href = fileHref(file);
  return (
    <div className="space-y-3 rounded-xl border border-line bg-paper px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="flex min-w-0 items-center gap-2 text-sm text-ink-900">
          <FileText className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
          <span className="min-w-0 truncate">
            {label && <strong className="font-semibold">{label}: </strong>}
            {file.name ?? "File"}
            {file.bytes ? <span className="text-ink-500"> · {formatBytes(file.bytes)}</span> : null}
          </span>
        </p>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center text-forest-800 underline underline-offset-2">Open PDF</a>
          <a href={`${href}?download=1`} className="inline-flex min-h-9 items-center text-ink-700 underline underline-offset-2">Save</a>
        </div>
      </div>
      {preview && <PdfPreview href={href} title={file.name ?? "PDF preview"} />}
    </div>
  );
}
