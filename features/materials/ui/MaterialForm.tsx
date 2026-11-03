"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { prepareMaterialUploadAction, saveMaterialAction, type MaterialFormState } from "@/app/dashboard/materials/actions";
import { rethrowNavigation } from "@/features/assignments/lib/upload";
import { sendToStorage } from "@/features/shared/lib/sendToStorage";
import { UploadBar } from "@/features/shared/ui/UploadBar";
import { MATERIALS_BUCKET } from "@/src/domains/materials/bucket";
import { MATERIAL_ACCEPT, MAX_MATERIAL_BYTES } from "@/src/domains/materials/limits";
import { formatBytes } from "@/src/domains/assignments/limits";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const label = "text-xs font-semibold text-ink-500 uppercase tracking-wider block mb-1";

/** The browser sends the file straight to storage, because Vercel refuses request bodies over 4.5 MB. Then only the details go to the server. */
export function MaterialForm({ batches, canShareWithAll }: { batches: { id: string; name: string }[]; canShareWithAll: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [percent, setPercent] = useState<number | null>(null);

  const [state, action, pending] = useActionState<MaterialFormState, FormData>(async (prev, formData) => {
    const values = { title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), batchId: String(formData.get("batchId") ?? "") };
    if (!file) return { error: "Choose a file.", values };
    if (file.size > MAX_MATERIAL_BYTES) return { error: "Files must be under 20 MB.", values };
    try {
      const ticket = await prepareMaterialUploadAction({ batchId: values.batchId, fileName: file.name, type: file.type, bytes: file.size });
      if ("error" in ticket) return { error: ticket.error, values };
      setPercent(0);
      try {
        await sendToStorage({ bucket: MATERIALS_BUCKET, path: ticket.path, token: ticket.token, file, type: ticket.type, onPercent: setPercent });
      } catch {
        return { error: "The upload didn't go through. Please check your connection and try again.", values };
      }
      setPercent(null);
      setStep("Saving…");
      formData.set("filePath", ticket.path);
      return await saveMaterialAction(prev, formData);
    } catch (err) {
      rethrowNavigation(err);
      return { error: "Something went wrong. Please try again.", values };
    } finally {
      setStep(null);
      setPercent(null);
    }
  }, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && <p role="alert" className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">{state.error}</p>}
      <div>
        <label htmlFor="title" className={label}>Title</label>
        <input id="title" name="title" required minLength={2} maxLength={150} defaultValue={state.values?.title} className={input} />
      </div>
      <div>
        <label htmlFor="description" className={label}>Note (optional)</label>
        <input id="description" name="description" maxLength={1000} defaultValue={state.values?.description} className={input} />
      </div>
      <div>
        <label htmlFor="batchId" className={label}>Share with</label>
        <select id="batchId" name="batchId" defaultValue={state.values?.batchId} className={input}>
          {canShareWithAll && <option value="all">All batches</option>}
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="file" className={label}>File (PDF, image, Word, PowerPoint · max {formatBytes(MAX_MATERIAL_BYTES)})</label>
        {/* No name, so the file itself is never sent to the server with the form. */}
        <input
          id="file"
          type="file"
          accept={MATERIAL_ACCEPT}
          disabled={pending}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink-700 file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-ink-100 file:px-4 file:font-semibold file:text-ink-900"
        />
        {file && state.error && <p className="mt-2 text-[13px] text-ink-500">Still selected: {file.name} · {formatBytes(file.size)}</p>}
      </div>
      {pending && <UploadBar label={step ?? "Uploading…"} percent={percent} />}
      <button type="submit" disabled={pending} className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-forest-800 text-sm font-semibold text-paper hover:bg-forest-900 disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {pending ? step ?? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
