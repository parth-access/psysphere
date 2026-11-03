"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitAnswerAction, type FormState } from "@/app/dashboard/assignments/actions";
import { MAX_ANSWER_BYTES, formatBytes } from "@/src/domains/assignments/limits";
import { FileLink, type FileRef } from "./FileLink";
import { FileProgress, FilePicker, RemoveFileToggle, useFileSend } from "./FilePicker";
import { rethrowNavigation } from "../lib/upload";

const box = "w-full min-h-11 px-4 py-3 border border-line rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";

function readDraft(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeDraft(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private windows can refuse storage. The answer box still works, it just won't survive a reload.
  }
}

export function AnswerForm({
  assignmentId,
  savedText,
  savedFile,
  late,
}: {
  assignmentId: string;
  savedText: string;
  savedFile: FileRef | null;
  late: boolean;
}) {
  const file = useFileSend("answer");
  const [removing, setRemoving] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const draftKey = `assignment-draft:${assignmentId}`;

  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    try {
      await file.send(formData, { role: "answer", assignmentId });
      file.setStep("Saving…");
      const result = await submitAnswerAction(prev, formData);
      if (result.ok) {
        writeDraft(draftKey, null);
        file.clear();
        setRemoving(false);
      }
      if (result.fileRejected) file.forgetUpload();
      return result;
    } catch (err) {
      rethrowNavigation(err);
      return { error: err instanceof Error ? err.message : "Something went wrong. Please try again." };
    } finally {
      file.setStep(null);
    }
  }, {});

  // Brings back unsent typing after a reload or a failed submit (React empties the form after each submit).
  useEffect(() => {
    const draft = readDraft(draftKey);
    if (draft !== null && textRef.current) textRef.current.value = draft;
  }, [draftKey, state]);

  const hasFile = !!file.picked || (!!savedFile && !removing);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-semibold text-ink-900">Type your answer{hasFile ? " (optional)" : ""}</label>
        <textarea
          ref={textRef}
          id="content"
          name="content"
          rows={10}
          defaultValue={savedText}
          onChange={(e) => writeDraft(draftKey, e.target.value)}
          className={box}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-ink-900">Or add your written work</p>
        {savedFile && !removing && !file.picked && <FileLink file={savedFile} label="Your file" />}
        {savedFile && !file.picked && (
          <RemoveFileToggle removing={removing} onChange={setRemoving} label="Remove this file" />
        )}
        <FilePicker picked={file.picked} onPick={file.setPicked} disabled={pending} maxLabel={formatBytes(MAX_ANSWER_BYTES)} />
        <FileProgress file={file} />
      </div>
      {late && <p className="text-sm font-medium text-gold-700">This is past the due date, so it will be marked as late.</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} aria-busy={pending || undefined} className="min-h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-70">
          {pending ? file.step ?? "Working…" : savedText || savedFile ? "Update my answer" : "Submit"}
        </button>
        {state.ok && (
          <p role="status" className="text-sm font-medium text-sage-600">{state.ok} {file.summary}</p>
        )}
        {state.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      </div>
    </form>
  );
}
