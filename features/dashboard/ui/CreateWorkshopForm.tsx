"use client";

import { useActionState } from "react";
import { createWorkshopAction, type CreateWorkshopState } from "@/app/dashboard/workshops/actions";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const label = "text-xs font-semibold text-ink-500 uppercase tracking-wider block mb-1";

export function CreateWorkshopForm() {
  const [state, action, pending] = useActionState<CreateWorkshopState, FormData>(createWorkshopAction, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="title" className={label}>Title</label>
        <input id="title" name="title" required placeholder="e.g. Why do we forget? Memory, simply explained" className={input} />
      </div>
      <div>
        <label htmlFor="description" className={label}>What students will learn</label>
        <textarea id="description" name="description" rows={3} className={`${input} py-3`} />
      </div>
      <div>
        <label htmlFor="classLevel" className={label}>For</label>
        <select id="classLevel" name="classLevel" defaultValue="both" className={input}>
          <option value="both">Class 11 & 12</option>
          <option value="class_11">Class 11</option>
          <option value="class_12">Class 12</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className={label}>Date</label>
          <input id="date" type="date" name="date" required className={input} />
        </div>
        <div>
          <label htmlFor="time" className={label}>Time (IST)</label>
          <input id="time" type="time" name="time" required className={input} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="durationMin" className={label}>Minutes</label>
          <input id="durationMin" type="number" name="durationMin" defaultValue={60} min={15} max={240} className={input} />
        </div>
        <div>
          <label htmlFor="capacity" className={label}>Seats</label>
          <input id="capacity" type="number" name="capacity" min={1} placeholder="No limit" className={input} />
        </div>
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="w-full min-h-11 rounded-full bg-forest-800 text-paper text-sm font-semibold hover:bg-forest-900 disabled:opacity-60">
        {pending ? "Creating Meet link…" : "Create workshop"}
      </button>
      <p className="text-xs text-ink-500">A Google Meet link is created automatically and the workshop appears on the website.</p>
    </form>
  );
}
