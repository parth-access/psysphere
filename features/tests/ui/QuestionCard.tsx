"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Trash2 } from "lucide-react";
import type { TestOption } from "@/db/schema/academic/tests";
import { deleteQuestionAction, moveQuestionAction, saveQuestionAction } from "@/app/dashboard/tests/actions";
import { QuestionForm } from "./TestForms";
import { PendingButton } from "@/features/shared/ui/PendingButton";

const LETTERS = "ABCDEF";
const iconBtn = "flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-paper hover:text-ink-900 disabled:opacity-30";

export function QuestionCard({
  testId,
  number,
  total,
  q,
  imageUrl,
  locked,
}: {
  testId: string;
  number: number;
  total: number;
  q: { id: string; prompt: string; options: TestOption[]; correctOptionId: string; explanation: string | null };
  imageUrl?: string | null;
  locked: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-[20px] border-2 border-forest-700 bg-surface p-5">
        <p className="mb-3 text-sm font-bold text-forest-800">Editing question {number}</p>
        <QuestionForm
          action={saveQuestionAction}
          testId={testId}
          onDone={() => setEditing(false)}
          defaults={{
            id: q.id,
            prompt: q.prompt,
            options: q.options.map((o) => o.text),
            correctIndex: q.options.findIndex((o) => o.id === q.correctOptionId),
            explanation: q.explanation ?? "",
            imageUrl,
          }}
        />
      </li>
    );
  }

  return (
    <li className="rounded-[20px] border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-deep text-sm font-bold text-ink-900">{number}</span>
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-line font-medium text-ink-900">{q.prompt}</p>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="mt-3 max-h-56 w-auto rounded-xl border border-line" />
          )}
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {q.options.map((o, i) => {
              const right = o.id === q.correctOptionId;
              return (
                <li key={o.id} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${right ? "bg-forest-50 font-semibold text-forest-800" : "bg-paper text-ink-700"}`}>
                  <span className="font-bold">{LETTERS[i]}</span>
                  <span className="flex-1">{o.text}</span>
                  {right && <Check className="h-4 w-4 shrink-0" aria-label="Right answer" />}
                </li>
              );
            })}
          </ul>
          {q.explanation && <p className="mt-3 text-sm text-ink-500"><span className="font-semibold text-ink-700">Explanation:</span> {q.explanation}</p>}
        </div>
        {!locked && (
          <div className="flex shrink-0 flex-col items-center gap-0.5 sm:flex-row">
            <form action={moveQuestionAction}>
              <input type="hidden" name="testId" value={testId} />
              <input type="hidden" name="questionId" value={q.id} />
              <input type="hidden" name="dir" value="up" />
              <PendingButton iconOnly disabled={number === 1} className={iconBtn} aria-label={`Move question ${number} up`}><ArrowUp className="h-4 w-4" /></PendingButton>
            </form>
            <form action={moveQuestionAction}>
              <input type="hidden" name="testId" value={testId} />
              <input type="hidden" name="questionId" value={q.id} />
              <input type="hidden" name="dir" value="down" />
              <PendingButton iconOnly disabled={number === total} className={iconBtn} aria-label={`Move question ${number} down`}><ArrowDown className="h-4 w-4" /></PendingButton>
            </form>
            <button type="button" onClick={() => setEditing(true)} className={iconBtn} aria-label={`Edit question ${number}`}><Pencil className="h-4 w-4" /></button>
            <form
              action={deleteQuestionAction}
              onSubmit={(e) => {
                if (!confirm(`Delete question ${number}?`)) e.preventDefault();
              }}
            >
              <input type="hidden" name="testId" value={testId} />
              <input type="hidden" name="questionId" value={q.id} />
              <PendingButton iconOnly className={`${iconBtn} hover:text-rose-600`} aria-label={`Delete question ${number}`}><Trash2 className="h-4 w-4" /></PendingButton>
            </form>
          </div>
        )}
      </div>
    </li>
  );
}
