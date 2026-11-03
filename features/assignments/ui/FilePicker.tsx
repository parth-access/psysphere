"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Camera, FileText, X } from "lucide-react";
import { MAX_PHOTOS, formatBytes } from "@/src/domains/assignments/limits";
import type { UploadRequest } from "@/app/dashboard/assignments/actions";
import { UploadBar } from "@/features/shared/ui/UploadBar";
import type { FileRole, Picked } from "../lib/compress";
import { sendFile, type SentFile } from "../lib/upload";

const pickButton = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink-900 hover:bg-paper focus-within:ring-2 focus-within:ring-ink-700/25";
const iconButton = "inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-paper-deep hover:text-ink-900 disabled:opacity-30";

/**
 * Holds what was picked and sends it when the form is submitted. Files are only compressed and uploaded then, so
 * someone who changes their mind leaves nothing in storage. If saving fails afterwards, a retry reuses the upload.
 */
export function useFileSend(role: FileRole) {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [percent, setPercent] = useState<number | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const done = useRef<{ picked: Picked; target: string; file: SentFile } | null>(null);

  /** Adds the uploaded file to the form data. Throws a message to show if it can't be sent. */
  async function send(formData: FormData, target: UploadRequest) {
    if (!picked) return;
    const key = JSON.stringify(target);
    if (done.current?.picked !== picked || done.current.target !== key) {
      try {
        done.current = { picked, target: key, file: await sendFile(picked, role, target, setStep, setPercent) };
      } finally {
        setPercent(null);
      }
    }
    const { file } = done.current;
    formData.set("filePath", file.path);
    formData.set("fileName", file.name);
    setSummary(file.bytes < file.originalBytes ? `Compressed from ${formatBytes(file.originalBytes)} to ${formatBytes(file.bytes)}.` : null);
  }

  function forgetUpload() {
    done.current = null;
  }

  function clear() {
    setPicked(null);
    forgetUpload();
  }

  return { picked, setPicked, step, setStep, percent, summary, send, clear, forgetUpload };
}

/** Only shows while a picked file is on its way, so saving a form without a file doesn't look like an upload. */
export function FileProgress({ file }: { file: Pick<ReturnType<typeof useFileSend>, "picked" | "step" | "percent"> }) {
  if (!file.picked || !file.step) return null;
  return <UploadBar label={file.step} percent={file.percent} />;
}

/** A hidden field, not a checkbox: React resets checkboxes after a failed save, which would undo the choice without showing it. */
export function RemoveFileToggle({ removing, onChange, label }: { removing: boolean; onChange: (removing: boolean) => void; label: string }) {
  return (
    <div>
      {removing && <input type="hidden" name="removeFile" value="on" />}
      <button type="button" onClick={() => onChange(!removing)} className="min-h-9 text-sm font-semibold text-ink-700 underline underline-offset-2 hover:text-ink-900">
        {removing ? "Keep the file" : label}
      </button>
    </div>
  );
}

function PhotoThumb({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  // A local preview of the person's own file, so there's nothing for next/image to optimise.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-14 w-11 shrink-0 rounded-md border border-line object-cover" />;
}

export function FilePicker({
  picked,
  onPick,
  disabled,
  allowPhotos = true,
  maxLabel,
}: {
  picked: Picked | null;
  onPick: (p: Picked | null) => void;
  disabled?: boolean;
  allowPhotos?: boolean;
  maxLabel: string;
}) {
  const [note, setNote] = useState<string | null>(null);

  function addPhotos(list: FileList | null) {
    const incoming = [...(list ?? [])];
    if (incoming.length === 0) return;
    const all = [...(picked?.kind === "photos" ? picked.files : []), ...incoming];
    setNote(all.length > MAX_PHOTOS ? `You can add up to ${MAX_PHOTOS} photos, so we kept the first ${MAX_PHOTOS}.` : null);
    onPick({ kind: "photos", files: all.slice(0, MAX_PHOTOS) });
  }

  function move(from: number, to: number) {
    if (picked?.kind !== "photos") return;
    const files = [...picked.files];
    const [item] = files.splice(from, 1);
    files.splice(to, 0, item);
    onPick({ kind: "photos", files });
  }

  function removeAt(i: number) {
    if (picked?.kind !== "photos") return;
    const files = picked.files.filter((_, n) => n !== i);
    onPick(files.length ? { kind: "photos", files } : null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <label className={pickButton}>
          <FileText className="h-4 w-4" aria-hidden="true" />
          {picked?.kind === "pdf" ? "Choose another PDF" : "Upload a PDF"}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setNote(null);
              if (file) onPick({ kind: "pdf", file });
              e.target.value = "";
            }}
          />
        </label>
        {allowPhotos && (
          <label className={pickButton}>
            <Camera className="h-4 w-4" aria-hidden="true" />
            {picked?.kind === "photos" ? "Add more photos" : "Add photos of your pages"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={disabled}
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <p className="text-[13px] text-ink-500">
        {allowPhotos ? "Photos are compressed and joined into one PDF. " : ""}Up to {maxLabel}.
      </p>
      {note && <p className="text-[13px] font-medium text-gold-700">{note}</p>}

      {picked?.kind === "pdf" && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-2">
          <p className="min-w-0 truncate text-sm text-ink-900">{picked.file.name} <span className="text-ink-500">· {formatBytes(picked.file.size)}</span></p>
          <button type="button" disabled={disabled} onClick={() => onPick(null)} aria-label={`Remove ${picked.file.name}`} className={iconButton}>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {picked?.kind === "photos" && (
        <ol className="space-y-2">
          {picked.files.map((file, i) => (
            <li key={`${file.name}-${file.lastModified}-${i}`} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2">
              <PhotoThumb file={file} />
              <p className="min-w-0 flex-1 text-sm text-ink-900">Page {i + 1} <span className="text-ink-500">· {formatBytes(file.size)}</span></p>
              <button type="button" disabled={disabled || i === 0} onClick={() => move(i, i - 1)} aria-label={`Move page ${i + 1} up`} className={iconButton}>
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" disabled={disabled || i === picked.files.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move page ${i + 1} down`} className={iconButton}>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" disabled={disabled} onClick={() => removeAt(i)} aria-label={`Remove page ${i + 1}`} className={iconButton}>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
