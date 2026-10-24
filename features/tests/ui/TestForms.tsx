"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2 } from "lucide-react";
import type { FormState } from "@/app/dashboard/tests/actions";
import { BULK_FORMAT_EXAMPLE } from "@/src/domains/tests/logic";

export const input =
  "w-full min-h-11 px-4 border border-line rounded-xl text-sm bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-800/25 focus:border-forest-800 disabled:bg-paper disabled:text-ink-500";
export const label = "text-xs font-semibold text-ink-500 uppercase tracking-wider block mb-1";
const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest-800 px-5 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-60";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

/**
 * Like useActionState, but submits through onSubmit. With <form action>, React clears the form after
 * every submit, so a teacher would lose a pasted list of questions just because one line had a typo.
 */
function useFormAction(action: Action) {
  const [state, dispatch, pending] = useActionState(action, null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return [state, onSubmit, pending] as const;
}

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.errors?.length) {
    return (
      <div role="alert" className="rounded-xl bg-rose-100 p-3 text-sm text-rose-600">
        <p className="mb-1 flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" aria-hidden="true" /> Nothing was added. Fix these and paste again:
        </p>
        <ul className="list-disc space-y-0.5 pl-6">
          {state.errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </div>
    );
  }
  if (state.error) {
    return (
      <p role="alert" className="flex items-center gap-2 rounded-xl bg-rose-100 p-3 text-sm font-medium text-rose-600">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl bg-forest-50 p-3 text-sm font-medium text-forest-800">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> {state.ok}
      </p>
    );
  }
  return null;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={pending} className={primary}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export type SettingsDefaults = {
  title: string;
  instructions: string;
  opensDate: string;
  opensTime: string;
  closesDate: string;
  closesTime: string;
  durationMinutes: number;
  marksPerCorrect: number;
  penaltyPerWrong: number;
  xpPerCorrect: number;
  shuffle: boolean;
};

/** Create a test (with a batch picker) or edit one's settings. */
export function TestSettingsForm({
  action,
  defaults,
  batches,
  testId,
  locked,
  submitLabel,
}: {
  action: Action;
  defaults: SettingsDefaults;
  batches?: { id: string; name: string }[];
  testId?: string;
  locked?: boolean;
  submitLabel: string;
}) {
  const [state, onSubmit, pending] = useFormAction(action);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {testId && <input type="hidden" name="testId" value={testId} />}
      <fieldset disabled={locked} className="space-y-4">
        {batches && (
          <div>
            <label htmlFor="batchId" className={label}>Batch</label>
            <select id="batchId" name="batchId" required className={input}>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="title" className={label}>Title</label>
          <input id="title" name="title" required defaultValue={defaults.title} placeholder="Chapter 3 test: Human Development" className={input} />
        </div>
        <div>
          <label htmlFor="instructions" className={label}>Instructions (optional)</label>
          <textarea id="instructions" name="instructions" rows={3} defaultValue={defaults.instructions} placeholder="Shown before the student starts." className={`${input} py-3`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="opensDate" className={label}>Opens</label>
            <input id="opensDate" type="date" name="opensDate" required defaultValue={defaults.opensDate} className={input} />
          </div>
          <div>
            <label htmlFor="opensTime" className={label}>at</label>
            <input id="opensTime" type="time" name="opensTime" required defaultValue={defaults.opensTime} className={input} />
          </div>
          <div>
            <label htmlFor="closesDate" className={label}>Closes</label>
            <input id="closesDate" type="date" name="closesDate" required defaultValue={defaults.closesDate} className={input} />
          </div>
          <div>
            <label htmlFor="closesTime" className={label}>at</label>
            <input id="closesTime" type="time" name="closesTime" required defaultValue={defaults.closesTime} className={input} />
          </div>
        </div>
        <div>
          <label htmlFor="durationMinutes" className={label}>Time limit (minutes)</label>
          <input id="durationMinutes" type="number" name="durationMinutes" min={1} max={600} required defaultValue={defaults.durationMinutes} className={input} />
          <p className="mt-1 text-xs text-ink-500">Starts when the student presses Start. Students can start any time while the test is open.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="marksPerCorrect" className={label}>Right</label>
            <input id="marksPerCorrect" type="number" step="0.25" min={0.25} name="marksPerCorrect" required defaultValue={defaults.marksPerCorrect} className={input} />
          </div>
          <div>
            <label htmlFor="penaltyPerWrong" className={label}>Wrong (−)</label>
            <input id="penaltyPerWrong" type="number" step="0.25" min={0} name="penaltyPerWrong" required defaultValue={defaults.penaltyPerWrong} className={input} />
          </div>
          <div>
            <label htmlFor="xpPerCorrect" className={label}>XP</label>
            <input id="xpPerCorrect" type="number" min={1} name="xpPerCorrect" required defaultValue={defaults.xpPerCorrect} className={input} />
          </div>
        </div>
        <p className="-mt-2 text-xs text-ink-500">
          Marks for a right answer and taken off for a wrong one. Skipped questions score 0. XP counts right answers only and shows straight after submitting; marks show after the test closes.
        </p>
        <label className="flex items-center gap-3 text-sm text-ink-900">
          <input type="checkbox" name="shuffle" defaultChecked={defaults.shuffle} className="h-4 w-4 accent-forest-800" />
          Shuffle questions and options for each student
        </label>
      </fieldset>
      <Status state={state} />
      {!locked && <Submit pending={pending}>{submitLabel}</Submit>}
    </form>
  );
}

export type QuestionDefaults = {
  id?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  imageUrl?: string | null;
};

const EMPTY_QUESTION: QuestionDefaults = { prompt: "", options: ["", "", "", ""], correctIndex: -1, explanation: "" };
const LETTERS = "ABCDEF";

export function QuestionForm({
  action,
  testId,
  defaults = EMPTY_QUESTION,
  onDone,
}: {
  action: Action;
  testId: string;
  defaults?: QuestionDefaults;
  onDone?: () => void;
}) {
  const [state, onSubmit, pending] = useFormAction(action);
  const [count, setCount] = useState(Math.max(4, defaults.options.filter(Boolean).length));
  const formRef = useRef<HTMLFormElement>(null);
  const editing = !!defaults.id;

  useEffect(() => {
    if (!state?.ok) return;
    if (editing) onDone?.();
    else formRef.current?.reset();
  }, [state, editing, onDone]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="testId" value={testId} />
      {defaults.id && <input type="hidden" name="questionId" value={defaults.id} />}
      <div>
        <label htmlFor={`prompt-${defaults.id ?? "new"}`} className={label}>Question</label>
        <textarea id={`prompt-${defaults.id ?? "new"}`} name="prompt" rows={3} required defaultValue={defaults.prompt} className={`${input} py-3`} />
      </div>

      <fieldset>
        <legend className={label}>Options · tick the right one</legend>
        <div className="space-y-2">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 has-[:checked]:border-forest-700 has-[:checked]:bg-forest-50">
                <input
                  type="radio"
                  name="correct"
                  value={i}
                  defaultChecked={defaults.correctIndex === i}
                  required
                  aria-label={`${LETTERS[i]} is the right answer`}
                  className="h-4 w-4 accent-forest-800"
                />
                <span className="w-3 text-sm font-bold text-ink-700" aria-hidden="true">{LETTERS[i]}</span>
              </label>
              <input name={`option${i}`} defaultValue={defaults.options[i] ?? ""} aria-label={`Option ${LETTERS[i]}`} className={input} />
            </div>
          ))}
        </div>
        {count < 6 && (
          <button type="button" onClick={() => setCount((c) => c + 1)} className="mt-2 text-sm font-semibold text-forest-800 hover:underline">
            + Add option {LETTERS[count]}
          </button>
        )}
      </fieldset>

      <div>
        <label htmlFor={`explanation-${defaults.id ?? "new"}`} className={label}>Explanation (optional)</label>
        <textarea id={`explanation-${defaults.id ?? "new"}`} name="explanation" rows={2} defaultValue={defaults.explanation} placeholder="Shown to students when answers unlock." className={`${input} py-3`} />
      </div>

      <div>
        <span className={label}>Image (optional)</span>
        {defaults.imageUrl && (
          <div className="mb-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={defaults.imageUrl} alt="" className="h-16 w-auto rounded-lg border border-line" />
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" name="removeImage" className="h-4 w-4 accent-forest-800" /> Remove image
            </label>
          </div>
        )}
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-4 text-sm text-ink-700 hover:bg-paper">
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-paper-deep file:px-3 file:py-1 file:text-sm file:font-semibold" />
        </label>
        <p className="mt-1 text-xs text-ink-500">PNG, JPG, WebP or GIF, up to 3 MB.</p>
      </div>

      <Status state={state} />
      <div className="flex flex-wrap gap-2">
        <Submit pending={pending}>{editing ? "Save question" : "Add question"}</Submit>
        {editing && onDone && (
          <button type="button" onClick={onDone} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold text-ink-900 hover:bg-paper">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function BulkPasteForm({ action, testId }: { action: Action; testId: string }) {
  const [state, onSubmit, pending] = useFormAction(action);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="testId" value={testId} />
      <label htmlFor="bulk-text" className={label}>Paste questions</label>
      <textarea id="bulk-text" name="text" rows={10} required placeholder={BULK_FORMAT_EXAMPLE} className={`${input} py-3 font-mono text-[13px] leading-relaxed`} />
      <details className="text-sm text-ink-700">
        <summary className="cursor-pointer font-semibold text-forest-800">How to write them</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-500">
          <li>Start each question with <code>Q:</code> or a number like <code>1.</code></li>
          <li>Write options as <code>A)</code> to <code>F)</code>, one per line. Between 2 and 6 options.</li>
          <li>End the right option with <code>*</code></li>
          <li>Optionally add a line starting with <code>Explanation:</code></li>
        </ul>
      </details>
      <Status state={state} />
      <Submit pending={pending}>Add these questions</Submit>
    </form>
  );
}
