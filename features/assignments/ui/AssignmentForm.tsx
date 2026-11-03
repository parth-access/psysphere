"use client";

import { useActionState, useState } from "react";
import { createAssignmentAction, updateAssignmentAction, type FormState } from "@/app/dashboard/assignments/actions";
import { MAX_QUESTION_BYTES, formatBytes } from "@/src/domains/assignments/limits";
import { FileLink, type FileRef } from "./FileLink";
import { FileProgress, FilePicker, RemoveFileToggle, useFileSend } from "./FilePicker";
import { rethrowNavigation } from "../lib/upload";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const label = "text-xs font-semibold text-ink-500 uppercase tracking-wider block mb-1";

type Existing = {
  id: string;
  batchId: string;
  title: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  maxMarks: number;
  allowLate: boolean;
  file: FileRef | null;
};

export function AssignmentForm({ batches, existing }: { batches: { id: string; name: string }[]; existing?: Existing }) {
  const file = useFileSend("question");
  const [removing, setRemoving] = useState(false);

  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const typedValues = Object.fromEntries([...formData].filter((e): e is [string, string] => typeof e[1] === "string"));
    try {
      await file.send(formData, { role: "question", batchId: existing?.batchId ?? String(formData.get("batchId")) });
      file.setStep("Saving…");
      const result = await (existing ? updateAssignmentAction : createAssignmentAction)(prev, formData);
      if (result.fileRejected) file.forgetUpload();
      return result;
    } catch (err) {
      rethrowNavigation(err);
      return { error: err instanceof Error ? err.message : "Something went wrong. Please try again.", values: typedValues };
    } finally {
      file.setStep(null);
    }
  }, {});

  const v = (name: string, saved: string | number) => state.values?.[name] ?? String(saved);

  return (
    <form action={action} className="space-y-4">
      {existing ? (
        <input type="hidden" name="id" value={existing.id} />
      ) : (
        <div>
          <label htmlFor="batchId" className={label}>Batch</label>
          <select id="batchId" name="batchId" required defaultValue={v("batchId", "") || undefined} className={input}>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="title" className={label}>Title</label>
        <input id="title" name="title" required defaultValue={v("title", existing?.title ?? "")} className={input} />
      </div>
      <div>
        <label htmlFor="instructions" className={label}>Paste the questions</label>
        <textarea id="instructions" name="instructions" rows={6} defaultValue={v("instructions", existing?.instructions ?? "")} className={`${input} py-3`} />
      </div>
      <div className="space-y-2">
        <p className={label}>Or upload a question paper</p>
        {existing?.file && !removing && !file.picked && <FileLink file={existing.file} />}
        {existing?.file && (
          <RemoveFileToggle removing={removing} onChange={setRemoving} label="Remove this PDF" />
        )}
        <FilePicker picked={file.picked} onPick={file.setPicked} disabled={pending} allowPhotos={false} maxLabel={formatBytes(MAX_QUESTION_BYTES)} />
        <FileProgress file={file} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div>
          <label htmlFor="dueDate" className={label}>Due date</label>
          <input id="dueDate" type="date" name="dueDate" required defaultValue={v("dueDate", existing?.dueDate ?? "")} className={input} />
        </div>
        <div>
          <label htmlFor="dueTime" className={label}>Time</label>
          <input id="dueTime" type="time" name="dueTime" required defaultValue={v("dueTime", existing?.dueTime ?? "21:00")} className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="maxMarks" className={label}>Out of (marks)</label>
        <input id="maxMarks" type="number" name="maxMarks" min={1} max={999} step="0.5" required defaultValue={v("maxMarks", existing?.maxMarks ?? 20)} className={input} />
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-line p-4">
        <input
          type="checkbox"
          name="allowLate"
          defaultChecked={state.values ? state.values.allowLate === "on" : existing?.allowLate ?? true}
          className="mt-0.5 h-4 w-4 accent-forest-800"
        />
        <span className="text-sm text-ink-900">
          <span className="block font-semibold">Accept late work</span>
          <span className="block text-[13px] text-ink-500">It’s labelled late. Turn this off to close submissions at the due time.</span>
        </span>
      </label>
      {state.error && <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button type="submit" disabled={pending} aria-busy={pending || undefined} className="w-full min-h-11 rounded-full bg-forest-800 px-4 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-70">
        {pending ? file.step ?? "Working…" : existing ? "Save changes" : "Create and share"}
      </button>
    </form>
  );
}
