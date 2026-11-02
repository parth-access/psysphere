"use client";

import { useState } from "react";
import { deleteAssignmentAction } from "@/app/dashboard/assignments/actions";
import { PendingButton } from "@/features/shared/ui/PendingButton";

export function DeleteAssignment({ id, submissions }: { id: string; submissions: number }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className="min-h-11 rounded-full px-4 text-sm font-semibold text-rose-600 hover:bg-rose-100">
        Delete assignment
      </button>
    );
  }
  return (
    <form action={deleteAssignmentAction} className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-100 bg-rose-100 p-4">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm font-medium text-rose-600">
        {submissions > 0
          ? `This also deletes ${submissions === 1 ? "1 student’s answer" : `${submissions} students’ answers`} and marks. It can’t be undone.`
          : "This can’t be undone."}
      </p>
      <PendingButton className="min-h-11 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white">Yes, delete it</PendingButton>
      <button type="button" onClick={() => setAsking(false)} className="min-h-11 rounded-full px-4 text-sm font-semibold text-ink-900">Keep it</button>
    </form>
  );
}
