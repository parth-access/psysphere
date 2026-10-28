"use client";

import { useActionState } from "react";
import { ExternalLink } from "lucide-react";
import {
  saveContactAction,
  saveClassDefaultsAction,
  saveNotificationsAction,
  type SettingsState,
} from "@/app/dashboard/settings/actions";
import type { Settings } from "@/src/domains/settings/service";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const label = "mb-1 block text-sm font-semibold text-ink-900";
const hint = "mt-1 text-[13px] text-ink-500";
const primary = "min-h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-60";

function Msg({ s }: { s: SettingsState }) {
  if (s.ok) return <p role="status" className="text-sm font-medium text-sage-600">{s.ok}</p>;
  if (s.error) return <p role="alert" className="text-sm font-medium text-rose-600">{s.error}</p>;
  return null;
}

/** After a failed save, show what was typed rather than the saved value (React resets forms after each submit). */
const keep = (s: SettingsState) => (name: string, saved: string | number | null) => (s.error && s.values ? s.values[name] ?? "" : saved ?? "");

function Save({ pending, s }: { pending: boolean; s: SettingsState }) {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-1">
      <button type="submit" disabled={pending} className={primary}>{pending ? "Saving…" : "Save"}</button>
      <Msg s={s} />
    </div>
  );
}

export function ContactSettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveContactAction, {});
  const v = keep(state);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-ink-500">Shown on the website footer and Contact page, on receipts, and in every email.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contactEmail" className={label}>Contact email</label>
          <input id="contactEmail" name="contactEmail" type="email" required defaultValue={v("contactEmail", settings.contactEmail)} className={input} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone</label>
          <input id="phone" name="phone" type="tel" required defaultValue={v("phone", settings.phone)} className={input} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="whatsappNumber" className={label}>WhatsApp number</label>
          <input id="whatsappNumber" name="whatsappNumber" type="tel" required defaultValue={v("whatsappNumber", `+${settings.whatsappNumber}`)} className={input} />
          <p className={hint}>With country code. Every WhatsApp button opens a chat here.</p>
        </div>
        <div>
          <label htmlFor="hours" className={label}>Hours</label>
          <input id="hours" name="hours" required defaultValue={v("hours", settings.hours)} placeholder="Mon to Sat, 10 am to 7 pm" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="whatsappMessage" className={label}>WhatsApp opening message</label>
        <input id="whatsappMessage" name="whatsappMessage" required defaultValue={v("whatsappMessage", settings.whatsappMessage)} className={input} />
        <p className={hint}>What the chat box is filled with when someone taps WhatsApp on the website.</p>
      </div>
      <div>
        <label htmlFor="address" className={label}>Location</label>
        <input id="address" name="address" required defaultValue={v("address", settings.address)} className={input} />
      </div>
      <a
        href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 underline underline-offset-2"
      >
        Try the saved WhatsApp link <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      <Save pending={pending} s={state} />
    </form>
  );
}

const LENGTHS = [45, 60, 75, 90, 120];

export function ClassDefaultsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveClassDefaultsAction, {});
  const v = keep(state);
  const minutes = Number(v("defaultClassMinutes", settings.defaultClassMinutes));
  const lengths = LENGTHS.includes(minutes) ? LENGTHS : [...LENGTHS, minutes].sort((a, b) => a - b);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-ink-500">What the forms start with when a teacher schedules a class or you add a batch. They can still change it each time.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="defaultClassTime" className={label}>Class start time</label>
          <input id="defaultClassTime" name="defaultClassTime" type="time" required defaultValue={v("defaultClassTime", settings.defaultClassTime)} className={input} />
        </div>
        <div>
          <label htmlFor="defaultClassMinutes" className={label}>Class length</label>
          <select id="defaultClassMinutes" name="defaultClassMinutes" defaultValue={String(minutes)} className={input}>
            {lengths.map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="defaultBatchSeats" className={label}>Seats per batch</label>
          <input id="defaultBatchSeats" name="defaultBatchSeats" type="number" min={1} max={500} placeholder="No limit" defaultValue={v("defaultBatchSeats", settings.defaultBatchSeats)} className={input} />
        </div>
      </div>
      <Save pending={pending} s={state} />
    </form>
  );
}

export function NotificationsForm({ settings, envAlertEmail }: { settings: Settings; envAlertEmail: string | null }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveNotificationsAction, {});
  const v = keep(state);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="alertEmail" className={label}>Send team alerts to</label>
        <input id="alertEmail" name="alertEmail" type="email" defaultValue={v("alertEmail", settings.alertEmail)} placeholder={envAlertEmail ?? "you@example.com"} className={input} />
        <p className={hint}>
          New join requests, contact messages and payment problems.{" "}
          {envAlertEmail ? <>Leave empty to keep using <strong>{envAlertEmail}</strong>.</> : "Nothing is sent until this is set."}
        </p>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-line p-4">
        <input type="checkbox" name="weeklyReports" defaultChecked={state.error && state.values ? state.values.weeklyReports === "on" : settings.weeklyReports} className="mt-1 h-4 w-4 accent-forest-800" />
        <span>
          <span className="block text-sm font-semibold text-ink-900">Weekly progress reports</span>
          <span className="block text-[13px] text-ink-500">Every Sunday morning, each student’s parent (or the student) gets their week: attendance, results and what’s next. Turn off during holidays.</span>
        </span>
      </label>
      <Save pending={pending} s={state} />
    </form>
  );
}
