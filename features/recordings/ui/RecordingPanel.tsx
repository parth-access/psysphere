"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Video } from "lucide-react";
import { deleteRecordingAction } from "@/app/dashboard/recordings/actions";
import { PendingButton } from "@/features/shared/ui/PendingButton";
import { formatBytes } from "@/src/domains/assignments/limits";
import { MAX_RECORDING_BYTES, VIDEO_EXTENSIONS } from "@/src/domains/recordings/limits";
import { uploadRecording, type Progress } from "../lib/upload";

export type RecordingSummary = { status: "none" | "processing" | "live" | "expired" | "deleted" | "failed"; liveUntil?: string };

const ACCEPT = VIDEO_EXTENSIONS.map((e) => `.${e}`).join(",");
const textButton = "min-h-9 text-sm font-semibold underline underline-offset-2";

function DeleteRecording({ sessionId }: { sessionId: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return <button type="button" onClick={() => setAsking(true)} className={`${textButton} text-rose-600`}>Delete</button>;
  }
  return (
    <form action={deleteRecordingAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <span className="text-sm text-rose-600">Students won’t be able to watch it. This can’t be undone.</span>
      <PendingButton className="min-h-9 rounded-full bg-rose-600 px-4 text-sm font-semibold text-white">Yes, delete it</PendingButton>
      <button type="button" onClick={() => setAsking(false)} className={`${textButton} text-ink-900`}>Keep it</button>
    </form>
  );
}

function Uploader({ sessionId, note }: { sessionId: string; note?: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const stop = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!progress) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [progress]);

  async function send(file: File) {
    setError(null);
    setPaused(false);
    setProgress({ sent: 0, total: file.size });
    const controller = new AbortController();
    stop.current = controller;
    try {
      await uploadRecording(sessionId, file, setProgress, controller.signal);
      router.refresh();
    } catch (err) {
      if (controller.signal.aborted) setPaused(true);
      else setError(err instanceof Error ? err.message : "The upload didn't go through. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  if (progress) {
    const percent = Math.floor((progress.sent / progress.total) * 100);
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-900">
          <span>Uploading: {percent}% of {formatBytes(progress.total)}. Keep this page open.</span>
          <button type="button" onClick={() => stop.current?.abort()} className={`${textButton} text-ink-700`}>Pause</button>
        </div>
        <div role="progressbar" aria-label="Upload progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-paper-deep">
          <div className="h-full rounded-full bg-forest-800" style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink-900 hover:bg-paper focus-within:ring-2 focus-within:ring-ink-700/25">
          <Upload className="h-4 w-4" aria-hidden="true" /> Upload recording
          <input
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void send(file);
            }}
          />
        </label>
        <Link href="/dashboard/recordings/guide" className="text-sm font-medium text-ink-700 underline underline-offset-2">How to record</Link>
      </div>
      {note && <p className="text-[13px] text-ink-500">{note}</p>}
      <p className="text-[13px] text-ink-500">MP4, MOV, WebM or MKV, up to {formatBytes(MAX_RECORDING_BYTES)}. Students get 24 hours to watch it.</p>
      {paused && <p className="text-sm font-medium text-ink-900">Paused. Choose the same file to carry on from where it stopped.</p>}
      {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}

/** Keeps asking until Drive has finished, so the page changes by itself and the 24 hours start promptly. */
function RefreshWhileProcessing() {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 20_000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}

/** The recording controls on a finished class. */
export function RecordingPanel({ sessionId, recording, driveReady, isAdmin }: { sessionId: string; recording: RecordingSummary; driveReady: boolean; isAdmin: boolean }) {
  if (recording.status === "processing") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RefreshWhileProcessing />
        <p className="flex items-center gap-2 text-sm text-ink-900">
          <Loader2 className="h-4 w-4 animate-spin text-ink-500" aria-hidden="true" />
          Google Drive is processing the video, which can take 20 minutes or longer. You can leave this page, and the 24 hours start when it’s ready.
        </p>
        <DeleteRecording sessionId={sessionId} />
      </div>
    );
  }
  if (recording.status === "live") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-ink-900">
          <Video className="h-4 w-4 text-sage-600" aria-hidden="true" />
          Live for students until {recording.liveUntil}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href={`/dashboard/recordings/${sessionId}`} className={`${textButton} text-forest-800`}>Watch</Link>
          <DeleteRecording sessionId={sessionId} />
        </div>
      </div>
    );
  }
  if (!driveReady) {
    return isAdmin ? (
      <p className="text-sm text-ink-500">To upload recordings, <a href="/dashboard/settings#google" className="font-semibold underline underline-offset-2">reconnect Google in Settings</a>.</p>
    ) : (
      <p className="text-sm text-ink-500">Recordings need an admin to reconnect Google in Settings.</p>
    );
  }
  const note = recording.status === "expired" ? "The last recording has expired." : recording.status === "failed" ? "Google Drive couldn’t process the last video. Please try uploading it again." : undefined;
  return <Uploader sessionId={sessionId} note={note} />;
}
