"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Camera, Loader2, MailCheck, Trash2 } from "lucide-react";
import {
  updateDetailsAction,
  changePasswordAction,
  uploadAvatarAction,
  removeAvatarAction,
  requestEmailChangeAction,
  cancelEmailChangeAction,
  unlinkGoogleAction,
  type ProfileState,
} from "@/app/dashboard/profile/actions";
import { Avatar } from "@/features/shared/ui/Avatar";
import { PendingButton } from "@/features/shared/ui/PendingButton";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const label = "mb-1 block text-sm font-semibold text-ink-900";
const hint = "mt-1 text-[13px] text-ink-500";
const primary = "min-h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-60";

function Msg({ s }: { s: ProfileState }) {
  if (s.ok) return <p role="status" className="text-sm font-medium text-sage-600">{s.ok}</p>;
  if (s.error) return <p role="alert" className="text-sm font-medium text-rose-600">{s.error}</p>;
  return null;
}

/** Centre-crops a photo to a square and shrinks it to 512px, so uploads are small and quick on mobile data. */
async function shrinkPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const out = Math.min(512, side);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, out, out);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  // Older Safari can't write WebP and hands back a PNG; JPEG is far smaller for photos.
  const final = blob?.type === "image/webp" ? blob : await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
  if (!final) throw new Error("could not encode");
  return new File([final], final.type === "image/webp" ? "photo.webp" : "photo.jpg", { type: final.type });
}

export function PhotoForm({ id, name, photo }: { id: string; name: string; photo: string | null }) {
  const [state, setState] = useState<ProfileState>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setState({ error: "Choose a photo (JPG, PNG or WebP)." });
    const url = URL.createObjectURL(file);
    setPreview(url);
    setState({});
    startTransition(async () => {
      let r: ProfileState;
      try {
        const fd = new FormData();
        fd.append("photo", await shrinkPhoto(file));
        r = await uploadAvatarAction({}, fd);
      } catch {
        r = { error: "We couldn't read that photo. Try a JPG or PNG." };
      }
      setState(r);
      setPreview(null);
      URL.revokeObjectURL(url);
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  const onRemove = () =>
    startTransition(async () => {
      setState(await removeAvatarAction());
    });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative self-start">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local preview of the chosen file
          <img src={preview} alt="" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <Avatar id={id} photo={photo} name={name} size={96} />
        )}
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-forest-950/40">
            <Loader2 className="h-6 w-6 animate-spin text-paper" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="sr-only"
            onChange={(e) => onPick(e.target.files?.[0])}
            disabled={pending}
          />
          <label
            htmlFor="photo"
            aria-disabled={pending || undefined}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-forest-800 px-5 text-sm font-semibold text-paper hover:bg-forest-900 aria-disabled:pointer-events-none aria-disabled:opacity-60 has-[:focus-visible]:ring-2"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {photo ? "Change photo" : "Add a photo"}
          </label>
          {photo && (
            <button
              type="button"
              onClick={onRemove}
              disabled={pending}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-ink-700 hover:bg-paper disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
        <p className="text-[13px] text-ink-500">{pending ? "Saving your photo…" : "A clear photo of your face works best. Teachers and classmates see it."}</p>
        <Msg s={state} />
      </div>
    </div>
  );
}

export function DetailsForm({
  fullName,
  phone,
  isStudent,
  guardian,
}: {
  fullName: string;
  phone: string | null;
  isStudent: boolean;
  guardian?: { name: string | null; phone: string | null; email: string | null };
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateDetailsAction, {});
  // After a failed save, show what was typed rather than the saved values.
  const v = (name: string, saved: string | null | undefined) => (state.error && state.values ? state.values[name] ?? "" : saved ?? "");
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="fullName" className={label}>Full name</label><input id="fullName" name="fullName" defaultValue={v("fullName", fullName)} required autoComplete="name" className={input} /></div>
      <div>
        <label htmlFor="phone" className={label}>Mobile number</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v("phone", phone)} placeholder="98765 43210" className={input} />
        <p className={hint}>{isStudent ? "Your teachers use this to reach you about classes." : "Used by the team to reach you about classes."}</p>
      </div>
      {isStudent && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="guardianName" className={label}>Parent’s name</label><input id="guardianName" name="guardianName" defaultValue={v("guardianName", guardian?.name)} className={input} /></div>
            <div><label htmlFor="guardianPhone" className={label}>Parent’s mobile</label><input id="guardianPhone" name="guardianPhone" type="tel" inputMode="tel" defaultValue={v("guardianPhone", guardian?.phone)} className={input} /></div>
          </div>
          <div>
            <label htmlFor="guardianEmail" className={label}>Parent’s email</label>
            <input id="guardianEmail" name="guardianEmail" type="email" defaultValue={v("guardianEmail", guardian?.email)} className={input} />
            <p className={hint}>The weekly progress report goes here. If empty, it comes to you.</p>
          </div>
        </>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primary}>{pending ? "Saving…" : "Save"}</button>
        <Msg s={state} />
      </div>
    </form>
  );
}

export function EmailForm({ email, pending: waiting }: { email: string; pending: { newEmail: string; sentAt: string } | null }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(requestEmailChangeAction, {});
  // Controlled, so a wrong password doesn't wipe the address they typed (forms reset after each submit).
  const [newEmail, setNewEmail] = useState("");
  return (
    <div className="space-y-5">
      <div>
        <p className={label}>You log in with</p>
        <p className="break-all text-[15px] text-ink-900">{email}</p>
      </div>

      {waiting && (
        <div className="flex items-start gap-3 rounded-xl border border-marigold-100 bg-marigold-100 p-4 text-sm text-gold-700">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-1">
            <p>
              Waiting for you to confirm <strong className="break-all">{waiting.newEmail}</strong>. Open the link we sent there ({waiting.sentAt}).
            </p>
            <form action={cancelEmailChangeAction}>
              <PendingButton className="font-semibold underline underline-offset-2 hover:text-ink-900">Cancel this change</PendingButton>
            </form>
          </div>
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="newEmail" className={label}>New email</label>
          <input id="newEmail" name="newEmail" type="email" autoComplete="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="emailPassword" className={label}>Current password</label>
          <input id="emailPassword" name="currentPassword" type="password" autoComplete="current-password" required className={input} />
          <p className={hint}>We’ll email a link to the new address. Your login changes once you open it.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className={primary}>{pending ? "Sending…" : "Send confirmation link"}</button>
          <Msg s={state} />
        </div>
      </form>
    </div>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ProfileState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="currentPassword" className={label}>Current password</label><input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className={input} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="password" className={label}>New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={input} /></div>
        <div><label htmlFor="confirm" className={label}>Type it again</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={input} /></div>
      </div>
      <p className={hint}>At least 8 characters. Forgot your current one? Log out and use Forgot password.</p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primary}>{pending ? "Changing…" : "Change password"}</button>
        <Msg s={state} />
      </div>
    </form>
  );
}

const LINK_MESSAGES: Record<string, { ok: boolean; text: string }> = {
  ok: { ok: true, text: "Google account linked. Join classes with this account and your attendance is marked for you. You can also log in with Google now." },
  cancelled: { ok: false, text: "Linking was cancelled. Nothing changed." },
  taken: { ok: false, text: "That Google account is already linked to another student. Choose your own account." },
  failed: { ok: false, text: "Google didn't finish linking. Try again." },
  state: { ok: false, text: "That link expired. Try again." },
  auth: { ok: false, text: "Log in again, then link your Google account." },
};

/** Students tell us which Google account they join Meet with, so their attendance can be taken automatically. */
export function GoogleLinkCard({ googleEmail, linked, result }: { googleEmail: string | null; linked: boolean; result?: string }) {
  const msg = result ? LINK_MESSAGES[result] : undefined;
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-700">
        Your attendance is taken from Google Meet. Link the Google account you join classes with, so we know it’s you even if your name looks different in Meet. Once linked, you can also log in with Google.
      </p>
      {linked ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-forest-100 bg-forest-50 px-4 py-3">
          <p className="min-w-0 text-sm text-forest-800">
            Linked{googleEmail ? <> to <strong className="break-all">{googleEmail}</strong></> : null}. Always join classes signed in to this account. You can also use it to log in.
          </p>
          <form action={unlinkGoogleAction}>
            <PendingButton className="text-sm font-semibold text-ink-700 underline underline-offset-2 hover:text-ink-900">Unlink</PendingButton>
          </form>
        </div>
      ) : (
        <a href="/api/integrations/google/link" className={`${primary} inline-flex items-center`}>Link Google account</a>
      )}
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm font-medium ${msg.ok ? "text-sage-600" : "text-rose-600"}`}>{msg.text}</p>}
    </div>
  );
}
