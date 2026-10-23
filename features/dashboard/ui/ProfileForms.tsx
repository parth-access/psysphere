"use client";

import { useActionState } from "react";
import { updateDetailsAction, changePasswordAction, type ProfileState } from "@/app/dashboard/profile/actions";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const label = "mb-1 block text-sm font-semibold text-ink-900";

function Msg({ s }: { s: ProfileState }) {
  if (s.ok) return <p role="status" className="text-sm font-medium text-sage-600">{s.ok}</p>;
  if (s.error) return <p role="alert" className="text-sm font-medium text-rose-600">{s.error}</p>;
  return null;
}

export function DetailsForm({
  fullName,
  isStudent,
  guardian,
}: {
  fullName: string;
  isStudent: boolean;
  guardian?: { name: string | null; phone: string | null; email: string | null };
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateDetailsAction, {});
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="fullName" className={label}>Full name</label><input id="fullName" name="fullName" defaultValue={fullName} required className={input} /></div>
      {isStudent && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="guardianName" className={label}>Parent’s name</label><input id="guardianName" name="guardianName" defaultValue={guardian?.name ?? ""} className={input} /></div>
            <div><label htmlFor="guardianPhone" className={label}>Parent’s mobile</label><input id="guardianPhone" name="guardianPhone" type="tel" defaultValue={guardian?.phone ?? ""} className={input} /></div>
          </div>
          <div>
            <label htmlFor="guardianEmail" className={label}>Parent’s email</label>
            <input id="guardianEmail" name="guardianEmail" type="email" defaultValue={guardian?.email ?? ""} className={input} />
            <p className="mt-1 text-[13px] text-ink-500">The weekly progress report goes here. If empty, it comes to you.</p>
          </div>
        </>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-60">Save</button>
        <Msg s={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ProfileState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="password" className={label}>New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={input} /></div>
      <div><label htmlFor="confirm" className={label}>Type it again</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={input} /></div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-60">Change password</button>
        <Msg s={state} />
      </div>
    </form>
  );
}
