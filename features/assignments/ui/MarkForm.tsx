"use client";

import { useActionState, useState } from "react";
import { saveMarksAction, type FormState } from "@/app/dashboard/assignments/actions";
import { MAX_ANSWER_BYTES, formatBytes } from "@/src/domains/assignments/limits";
import { FileLink, type FileRef } from "./FileLink";
import { FileProgress, FilePicker, RemoveFileToggle, useFileSend } from "./FilePicker";
import { rethrowNavigation } from "../lib/upload";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const small = "mb-1 block text-xs font-semibold text-ink-500";

export function MarkForm({
  attemptId,
  max,
  marks,
  feedback,
  checkedFile,
}: {
  attemptId: string;
  max: number;
  marks: number | null;
  feedback: string | null;
  checkedFile: FileRef | null;
}) {
  const file = useFileSend("checked");
  const [removing, setRemoving] = useState(false);

  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const values = Object.fromEntries([...formData].filter((e): e is [string, string] => typeof e[1] === "string"));
    try {
      await file.send(formData, { role: "checked", attemptId });
      file.setStep("Saving…");
      const result = await saveMarksAction(prev, formData);
      if (result.ok) {
        file.clear();
        setRemoving(false);
      }
      if (result.fileRejected) file.forgetUpload();
      return result;
    } catch (err) {
      rethrowNavigation(err);
      return { error: err instanceof Error ? err.message : "Something went wrong. Please try again.", values };
    } finally {
      file.setStep(null);
    }
  }, {});

  return (
    <form action={action} className="space-y-3 rounded-xl border border-line p-4">
      <input type="hidden" name="attemptId" value={attemptId} />
      <div className="flex flex-wrap items-start gap-3">
        <div className="w-28">
          <label htmlFor={`m-${attemptId}`} className={small}>Marks / {max}</label>
          <input id={`m-${attemptId}`} name="marks" type="number" step="0.5" min={0} max={max} required defaultValue={state.values?.marks ?? marks ?? undefined} className={input} />
        </div>
        <div className="min-w-60 flex-1">
          <label htmlFor={`f-${attemptId}`} className={small}>Comment</label>
          <input id={`f-${attemptId}`} name="feedback" defaultValue={state.values?.feedback ?? feedback ?? ""} className={input} />
        </div>
      </div>
      <details open={!!checkedFile || !!file.picked}>
        <summary className="cursor-pointer text-sm font-semibold text-ink-700">Send back a checked copy (optional)</summary>
        <div className="mt-3 space-y-2">
          {checkedFile && !removing && !file.picked && <FileLink file={checkedFile} label="Checked copy" />}
          {checkedFile && !file.picked && (
            <RemoveFileToggle removing={removing} onChange={setRemoving} label="Remove this copy" />
          )}
          <FilePicker picked={file.picked} onPick={file.setPicked} disabled={pending} maxLabel={formatBytes(MAX_ANSWER_BYTES)} />
          <FileProgress file={file} />
        </div>
      </details>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} aria-busy={pending || undefined} className="min-h-11 rounded-full bg-forest-800 px-5 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-70">
          {pending ? file.step ?? "Working…" : marks != null ? "Update" : "Save marks"}
        </button>
        {state.ok && <p role="status" className="text-sm font-medium text-sage-600">{state.ok}</p>}
        {state.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      </div>
    </form>
  );
}
