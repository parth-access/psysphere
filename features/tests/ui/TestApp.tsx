"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Bookmark, CheckCircle2, CloudOff, Eraser, Expand, Grid3x3, Loader2, Timer, X,
} from "lucide-react";
import { saveProgressAction, startTestAction, submitTestAction } from "@/app/test/actions";

export type RunnerQuestion = { id: string; prompt: string; imageUrl: string | null; options: { id: string; text: string }[] };

type Info = {
  testId: string;
  title: string;
  batchName: string;
  instructions: string | null;
  durationMinutes: number;
  questionCount: number;
  marksPerCorrect: number;
  penaltyPerWrong: number;
  xpPerCorrect: number;
  closesAt: string;
};

type AttemptState = {
  id: string;
  endsAt: string;
  answers: Record<string, string>;
  marked: string[];
  visited: string[];
  exitCount: number;
};

const LETTERS = "ABCDEF";

/* ---------------- Full screen ---------------- */

const fsSupported = () => typeof document !== "undefined" && !!document.documentElement.requestFullscreen && document.fullscreenEnabled;
/**
 * Must be called straight from a click. Never waits more than a second: some browsers leave the
 * request hanging, and the test must not depend on it. Denied or unsupported (iPhone) is fine too;
 * exits are still caught.
 */
function enterFullscreen(): Promise<void> {
  if (!fsSupported() || document.fullscreenElement) return Promise.resolve();
  const request = document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
  return Promise.race([request, new Promise<void>((r) => setTimeout(r, 1000))]);
}
async function leaveFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {}
}

const subscribeFullscreen = (cb: () => void) => {
  document.addEventListener("fullscreenchange", cb);
  return () => document.removeEventListener("fullscreenchange", cb);
};
/** True when the browser could go full screen but currently isn't. False on the server and on iPhones. */
const useOutOfFullscreen = () =>
  useSyncExternalStore(subscribeFullscreen, () => fsSupported() && !document.fullscreenElement, () => false);

// Exit events go out one at a time, in order: a quick switch away and back fires "left" and
// "returned" almost together, and "returned" must not reach the server before the row exists.
let exitQueue: Promise<unknown> = Promise.resolve();
function beacon(body: object) {
  const data = JSON.stringify(body);
  exitQueue = exitQueue.then(() =>
    fetch("/api/tests/exits", { method: "POST", body: data, keepalive: true, headers: { "content-type": "application/json" } })
      .catch(() => navigator.sendBeacon?.("/api/tests/exits", new Blob([data], { type: "application/json" })))
  );
}

const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
};
const istWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/* ================================================================== */

export function TestApp({
  info,
  attempt,
  questions,
  serverNow,
}: {
  info: Info;
  attempt: AttemptState | null;
  questions: RunnerQuestion[];
  serverNow: string;
}) {
  if (!attempt) return <StartScreen info={info} />;
  return <Runner key={attempt.id} info={info} attempt={attempt} questions={questions} serverNow={serverNow} />;
}

/* ---------------- Before starting ---------------- */

function StartScreen({ info }: { info: Info }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setPending(true);
    setError(null);
    void enterFullscreen(); // has to start inside the click, before any await
    const r = await startTestAction(info.testId);
    if ("error" in r) {
      setError(r.error);
      setPending(false);
      await leaveFullscreen();
      return;
    }
    router.refresh();
  }

  const rules = [
    `${info.questionCount} questions, ${info.durationMinutes} minutes. The timer starts when you press Start and keeps running even if you close the page.`,
    `+${info.marksPerCorrect} for a right answer${info.penaltyPerWrong ? `, −${info.penaltyPerWrong} for a wrong one` : ""}. Skipped questions score 0.`,
    "The test opens full screen. Switching apps or tabs, minimising, or leaving full screen is recorded, and your teacher sees when and for how long.",
    "Your answers save as you go. When time runs out, the test submits itself.",
    `You get ${info.xpPerCorrect} XP for each right answer, shown when you submit. Marks and answers unlock when the test closes.`,
  ];

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-xl space-y-6 rounded-[28px] border border-line bg-surface p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-800">{info.batchName}</p>
          <h1 className="mt-1 font-serif text-[34px] leading-[1.05] text-ink-900">{info.title}</h1>
        </div>
        {info.instructions && <p className="whitespace-pre-line rounded-2xl bg-paper-deep p-4 text-ink-700">{info.instructions}</p>}
        <ol className="space-y-3">
          {rules.map((r, i) => (
            <li key={r} className="flex gap-3 text-[15px] text-ink-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-50 text-xs font-bold text-forest-800">{i + 1}</span>
              {r}
            </li>
          ))}
        </ol>
        {error && <p role="alert" className="rounded-xl bg-rose-100 p-3 text-sm font-medium text-rose-600">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={start}
            disabled={pending}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-800 px-7 font-bold text-paper hover:bg-forest-900 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Expand className="h-5 w-5" aria-hidden="true" />}
            Start test
          </button>
          <Link href={`/dashboard/tests/${info.testId}`} className="text-sm font-semibold text-ink-500 hover:text-ink-900">Not now</Link>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Taking the test ---------------- */

type Update = { questionId: string; answer?: string | null; marked?: boolean };
type Overlay = null | { kind: "left" };

function Runner({ info, attempt, questions, serverNow }: { info: Info; attempt: AttemptState; questions: RunnerQuestion[]; serverNow: string }) {
  const endsAt = new Date(attempt.endsAt).getTime();
  const serverNowMs = new Date(serverNow).getTime();
  // How far this device's clock is from the server's; set once on mount.
  const skew = useRef(0);

  const [startIndex] = useState(() => {
    const firstOpen = questions.findIndex((q) => !attempt.answers[q.id]);
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [index, setIndex] = useState(startIndex);
  const [answers, setAnswers] = useState(attempt.answers);
  const [marked, setMarked] = useState(() => new Set(attempt.marked));
  const [visited, setVisited] = useState(() => new Set([...attempt.visited, questions[startIndex]?.id].filter(Boolean)));
  const [exitCount, setExitCount] = useState(attempt.exitCount);
  const [remaining, setRemaining] = useState(endsAt - serverNowMs);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [resumeDismissed, setResumeDismissed] = useState(false);
  const outOfFullscreen = useOutOfFullscreen();
  const [confirming, setConfirming] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "retrying">("saved");
  const [done, setDone] = useState<null | { xp: number; timeUp: boolean }>(null);

  const finished = useRef(false);
  const away = useRef<null | { id: string; reason: "hidden" | "blur" | "fullscreen" }>(null);
  const currentId = useRef<string | undefined>(undefined);
  useEffect(() => {
    currentId.current = questions[index]?.id;
  }, [index, questions]);
  const awayKey = `test-away:${attempt.id}`;

  /* ---- save queue: one request at a time, in order, retried until it lands ---- */
  const queue = useRef<Update[]>([]);
  const working = useRef(false);
  const finishRef = useRef<(timeUp: boolean) => void>(() => {});

  const pump = useCallback(async () => {
    if (working.current) return;
    working.current = true;
    while (queue.current.length) {
      setSaveState("saving");
      const next = queue.current[0];
      try {
        const r = await saveProgressAction(attempt.id, next);
        queue.current.shift();
        if (!r.ok && (r.reason === "time_up" || r.reason === "submitted")) {
          queue.current = [];
          finishRef.current(true);
        }
      } catch {
        setSaveState("retrying");
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
    setSaveState("saved");
    working.current = false;
  }, [attempt.id]);

  const save = useCallback((u: Update) => {
    if (finished.current) return;
    queue.current.push(u);
    void pump();
  }, [pump]);

  async function flush(timeoutMs = 6000) {
    const until = Date.now() + timeoutMs;
    while ((queue.current.length || working.current) && Date.now() < until) await new Promise((r) => setTimeout(r, 150));
  }

  /* ---- finishing ---- */
  const finish = useCallback(async (timeUp: boolean) => {
    if (finished.current) return;
    finished.current = true;
    setConfirming(false);
    setOverlay(null);
    await flush();
    let xp = 0;
    for (let i = 0; i < 4; i++) {
      try {
        const r = await submitTestAction(attempt.id);
        if ("ok" in r) xp = r.xp ?? 0;
        break;
      } catch {
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
    try { sessionStorage.removeItem(awayKey); } catch {}
    await leaveFullscreen();
    // No refresh here: the server page now redirects a submitted attempt, which would skip this screen.
    setDone({ xp, timeUp });
  }, [attempt.id, awayKey]);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  /* ---- timer ---- */
  useEffect(() => {
    skew.current = serverNowMs - Date.now();
    const t = setInterval(() => {
      const r = endsAt - (Date.now() + skew.current);
      setRemaining(r);
      if (r <= 0) void finish(true);
    }, 500);
    return () => clearInterval(t);
  }, [endsAt, serverNowMs, finish]);

  /* ---- the first question counts as visited as soon as the test opens ---- */
  useEffect(() => {
    const first = questions[startIndex];
    if (first && !attempt.visited.includes(first.id)) save({ questionId: first.id });
  }, [questions, startIndex, attempt.visited, save]);

  /* ---- leaving the screen ---- */
  useEffect(() => {
    // Came back after a reload or crash: close the exit that was left open, then ask to go full screen again.
    try {
      const pending = sessionStorage.getItem(awayKey);
      if (pending) {
        beacon({ event: "returned", attemptId: attempt.id, exitId: pending });
        sessionStorage.removeItem(awayKey);
      }
    } catch {}

    const leave = (reason: "hidden" | "blur" | "fullscreen") => {
      if (finished.current || away.current) return;
      const id = crypto.randomUUID();
      away.current = { id, reason };
      try { sessionStorage.setItem(awayKey, id); } catch {}
      beacon({ event: "left", attemptId: attempt.id, exitId: id, reason, questionId: currentId.current });
      setExitCount((n) => n + 1);
      setOverlay({ kind: "left" });
    };
    const back = (reasons: string[]) => {
      if (!away.current || !reasons.includes(away.current.reason)) return;
      beacon({ event: "returned", attemptId: attempt.id, exitId: away.current.id });
      try { sessionStorage.removeItem(awayKey); } catch {}
      away.current = null;
    };

    let blurTimer: ReturnType<typeof setTimeout> | undefined;
    const onVisibility = () => {
      if (document.hidden) leave("hidden");
      else back(["hidden", "blur"]);
    };
    // Switching tabs fires blur and visibilitychange together; wait a moment so it's logged as "hidden".
    const onBlur = () => {
      clearTimeout(blurTimer);
      blurTimer = setTimeout(() => { if (!document.hasFocus()) leave(document.hidden ? "hidden" : "blur"); }, 200);
    };
    const onFocus = () => { clearTimeout(blurTimer); back(["blur", "hidden"]); };
    let wasFull = !!document.fullscreenElement;
    const onFullscreen = () => {
      const full = !!document.fullscreenElement;
      if (wasFull && !full) leave("fullscreen");
      if (full) back(["fullscreen"]);
      wasFull = full;
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!finished.current) e.preventDefault();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      clearTimeout(blurTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [attempt.id, awayKey]);

  /* ---- actions ---- */
  const q = questions[index];
  const go = (i: number) => {
    const n = Math.max(0, Math.min(questions.length - 1, i));
    const target = questions[n];
    if (target && !visited.has(target.id)) {
      setVisited((v) => new Set(v).add(target.id));
      save({ questionId: target.id });
    }
    setIndex(n);
    setPaletteOpen(false);
  };
  const choose = (optionId: string) => {
    if (answers[q.id] === optionId) return;
    setAnswers((a) => ({ ...a, [q.id]: optionId }));
    save({ questionId: q.id, answer: optionId });
  };
  const clear = () => {
    if (!answers[q.id]) return;
    setAnswers((a) => {
      const n = { ...a };
      delete n[q.id];
      return n;
    });
    save({ questionId: q.id, answer: null });
  };
  const toggleMark = () => {
    const on = !marked.has(q.id);
    setMarked((m) => {
      const n = new Set(m);
      if (on) n.add(q.id);
      else n.delete(q.id);
      return n;
    });
    save({ questionId: q.id, marked: on });
    if (on && index < questions.length - 1) go(index + 1);
  };

  /* ---- keyboard: A–F or 1–6 to answer, arrows to move ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (overlay || confirming || done || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toUpperCase();
      const byLetter = LETTERS.indexOf(k);
      const byNumber = Number(k) - 1;
      const n = byLetter >= 0 && k.length === 1 ? byLetter : byNumber >= 0 && byNumber < 6 ? byNumber : -1;
      if (n >= 0 && q?.options[n]) { e.preventDefault(); choose(q.options[n].id); }
      else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ---- counts for the palette and the submit summary ---- */
  const counts = useMemo(() => {
    let answered = 0, markedN = 0, notAnswered = 0, notVisited = 0;
    for (const x of questions) {
      const a = !!answers[x.id];
      if (a) answered++;
      if (marked.has(x.id)) markedN++;
      if (!a && visited.has(x.id)) notAnswered++;
      if (!visited.has(x.id)) notVisited++;
    }
    return { answered, marked: markedN, notAnswered, notVisited };
  }, [questions, answers, marked, visited]);

  /* ---------------- Done ---------------- */
  if (done) {
    const maxXp = questions.length * info.xpPerCorrect;
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-paper px-4">
        <div className="w-full max-w-md space-y-5 rounded-[28px] border border-line bg-surface p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-forest-700" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl text-ink-900">{done.timeUp ? "Time’s up" : "Submitted"}</h1>
            <p className="mt-1 text-ink-500">{done.timeUp ? "Your answers were submitted automatically." : "Your answers are in."}</p>
          </div>
          <div className="rounded-[20px] bg-butter p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">You earned</p>
            <p className="font-sans text-6xl font-semibold text-ink-900">{done.xp}<span className="text-2xl text-ink-500">/{maxXp} XP</span></p>
          </div>
          <p className="text-sm text-ink-700">Your marks and the right answers unlock when the test closes, {istWhen(info.closesAt)}.</p>
          <Link href={`/dashboard/tests/${info.testId}`} className="inline-flex min-h-12 items-center rounded-full bg-forest-800 px-6 font-bold text-paper hover:bg-forest-900">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const low = remaining <= 60_000;
  const warn = !low && remaining <= 5 * 60_000;
  const answered = q ? answers[q.id] : undefined;
  const isMarked = q ? marked.has(q.id) : false;

  const palette = (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {questions.map((x, i) => {
          const a = !!answers[x.id];
          const m = marked.has(x.id);
          const v = visited.has(x.id);
          const cls = m
            ? "bg-lilac text-ink-900 border-transparent"
            : a ? "bg-forest-700 text-paper border-transparent"
            : v ? "bg-rose-100 text-rose-600 border-transparent"
            : "bg-surface text-ink-700 border-line";
          const state = m ? (a ? "answered, marked for review" : "marked for review") : a ? "answered" : v ? "not answered" : "not visited";
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Question ${i + 1}, ${state}`}
              aria-current={i === index ? "true" : undefined}
              className={`relative flex h-11 items-center justify-center rounded-xl border text-sm font-bold ${cls} ${i === index ? "ring-2 ring-gold-500 ring-offset-2 ring-offset-paper" : ""}`}
            >
              {i + 1}
              {m && a && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-surface bg-forest-700" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-ink-700">
        <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-forest-700" />Answered · {counts.answered}</li>
        <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-rose-100" />Not answered · {counts.notAnswered}</li>
        <li className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-lilac" />For review · {counts.marked}</li>
        <li className="flex items-center gap-2"><span className="h-4 w-4 rounded border border-line bg-surface" />Not visited · {counts.notVisited}</li>
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-paper text-ink-900">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg leading-tight">{info.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-500" aria-live="polite">
            {saveState === "retrying" ? (
              <><CloudOff className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" /><span className="text-rose-600">No connection. Retrying, keep going.</span></>
            ) : saveState === "saving" ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Saving…</>
            ) : (
              <><CheckCircle2 className="h-3.5 w-3.5 text-forest-700" aria-hidden="true" />All answers saved</>
            )}
          </p>
        </div>
        <div
          role="timer"
          aria-label={`Time left ${fmtClock(remaining)}`}
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-sans text-lg font-semibold tabular-nums ${low ? "animate-pulse bg-rose-600 text-paper" : warn ? "bg-butter text-gold-700" : "bg-forest-900 text-paper"}`}
        >
          <Timer className="h-5 w-5" aria-hidden="true" />
          {fmtClock(remaining)}
        </div>
        <button type="button" onClick={() => setConfirming(true)} className="hidden min-h-10 rounded-full bg-gold-500 px-5 text-sm font-bold text-ink-900 hover:bg-gold-400 sm:block">
          Submit
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Question */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {q && (
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-forest-800">Question {index + 1} of {questions.length}</p>
                {isMarked && <span className="inline-flex items-center gap-1 rounded-full bg-lilac px-2.5 py-1 text-xs font-semibold"><Bookmark className="h-3.5 w-3.5" aria-hidden="true" />Marked for review</span>}
              </div>
              <h2 id="q-prompt" className="select-none whitespace-pre-line text-[19px] leading-relaxed text-ink-900 sm:text-xl" onCopy={(e) => e.preventDefault()}>
                {q.prompt}
              </h2>
              {q.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={q.imageUrl} alt="" draggable={false} className="mt-5 max-h-[40vh] w-auto rounded-2xl border border-line bg-surface" />
              )}
              <div role="radiogroup" aria-labelledby="q-prompt" className="mt-6 space-y-3">
                {q.options.map((o, i) => {
                  const on = answered === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`flex min-h-14 cursor-pointer select-none items-center gap-4 rounded-2xl border-2 px-4 py-3 transition-colors ${on ? "border-forest-700 bg-forest-50" : "border-line bg-surface hover:border-ink-300"}`}
                      onCopy={(e) => e.preventDefault()}
                    >
                      <input type="radio" name={`q-${q.id}`} value={o.id} checked={on} onChange={() => choose(o.id)} className="sr-only" />
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${on ? "bg-forest-700 text-paper" : "bg-paper-deep text-ink-700"}`}>
                        {LETTERS[i]}
                      </span>
                      <span className="text-[16px] leading-snug">{o.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* Palette: side panel on wide screens */}
        <aside aria-label="Question palette" className="hidden w-80 shrink-0 overflow-y-auto border-l border-line bg-surface p-5 lg:block">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">Questions</p>
          {palette}
        </aside>
      </div>

      {/* Bottom bar */}
      <footer className="shrink-0 border-t border-line bg-surface px-3 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="flex min-h-12 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold disabled:opacity-40" aria-label="Previous question">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Previous</span>
          </button>
          <button type="button" onClick={() => setPaletteOpen(true)} className="flex min-h-12 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold lg:hidden" aria-label="All questions">
            <Grid3x3 className="h-4 w-4" aria-hidden="true" />{index + 1}/{questions.length}
          </button>
          <div className="flex-1" />
          <button type="button" onClick={clear} disabled={!answered} className="flex min-h-12 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-700 hover:bg-paper disabled:opacity-40">
            <Eraser className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Clear</span>
          </button>
          <button type="button" onClick={toggleMark} aria-pressed={isMarked} className={`flex min-h-12 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${isMarked ? "bg-lilac" : "text-ink-700 hover:bg-paper"}`}>
            <Bookmark className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">{isMarked ? "Unmark" : "Mark for review"}</span>
          </button>
          {index < questions.length - 1 ? (
            <button type="button" onClick={() => go(index + 1)} className="flex min-h-12 items-center gap-1.5 rounded-full bg-forest-800 px-5 text-sm font-bold text-paper hover:bg-forest-900">
              Next<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="flex min-h-12 items-center rounded-full bg-gold-500 px-5 text-sm font-bold text-ink-900 hover:bg-gold-400">
              Submit
            </button>
          )}
        </div>
      </footer>

      {/* Palette: bottom sheet on phones and tablets */}
      {paletteOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="All questions">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-forest-950/50" onClick={() => setPaletteOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-[28px] bg-surface p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-serif text-xl">All questions</p>
              <button type="button" onClick={() => setPaletteOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-paper" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {palette}
            <button type="button" onClick={() => { setPaletteOpen(false); setConfirming(true); }} className="mt-6 min-h-12 w-full rounded-full bg-gold-500 font-bold text-ink-900">
              Submit test
            </button>
          </div>
        </div>
      )}

      {/* Submit summary */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-title">
          <div className="w-full max-w-md space-y-5 rounded-[28px] bg-surface p-6 sm:p-7">
            <h2 id="submit-title" className="font-serif text-2xl">Submit the test?</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Answered", counts.answered, "text-forest-800"],
                ["Not answered", counts.notAnswered, "text-rose-600"],
                ["Marked for review", counts.marked, "text-ink-900"],
                ["Not visited", counts.notVisited, "text-ink-500"],
              ].map(([label, n, cls]) => (
                <div key={label as string} className="rounded-2xl bg-paper p-3">
                  <dt className="text-ink-500">{label}</dt>
                  <dd className={`font-sans text-2xl font-semibold ${cls}`}>{n}</dd>
                </div>
              ))}
            </dl>
            {counts.answered < questions.length && (
              <p className="flex gap-2 rounded-xl bg-butter p-3 text-sm text-gold-700">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {questions.length - counts.answered} question{questions.length - counts.answered === 1 ? " is" : "s are"} unanswered. You can’t change answers after submitting.
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirming(false)} className="min-h-12 rounded-full border border-line px-5 font-semibold">Keep working</button>
              <button type="button" onClick={() => void finish(false)} className="min-h-12 rounded-full bg-forest-800 px-6 font-bold text-paper hover:bg-forest-900">Submit test</button>
            </div>
          </div>
        </div>
      )}

      {/* Left the screen, or came back after a reload */}
      {(overlay || (outOfFullscreen && !resumeDismissed)) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-950/80 p-4" role="alertdialog" aria-modal="true" aria-labelledby="away-title" aria-describedby="away-desc">
          <div className="w-full max-w-md space-y-4 rounded-[28px] bg-surface p-6 text-center sm:p-8">
            {overlay?.kind === "left" ? (
              <>
                <AlertTriangle className="mx-auto h-11 w-11 text-rose-600" aria-hidden="true" />
                <h2 id="away-title" className="font-serif text-2xl">You left the test screen</h2>
                <p id="away-desc" className="text-ink-700">
                  This has been recorded: <strong>{exitCount} time{exitCount === 1 ? "" : "s"}</strong> so far. Your teacher can see when and for how long. The timer kept running.
                </p>
              </>
            ) : (
              <>
                <Expand className="mx-auto h-11 w-11 text-forest-800" aria-hidden="true" />
                <h2 id="away-title" className="font-serif text-2xl">Continue your test</h2>
                <p id="away-desc" className="text-ink-700">Your answers are saved and the timer is still running: {fmtClock(remaining)} left.</p>
              </>
            )}
            <button
              type="button"
              autoFocus
              onClick={() => {
                void enterFullscreen();
                setOverlay(null);
                setResumeDismissed(true);
              }}
              className="min-h-12 w-full rounded-full bg-forest-800 font-bold text-paper hover:bg-forest-900"
            >
              Back to the test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
