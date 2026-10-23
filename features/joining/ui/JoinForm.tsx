"use client";

import { useActionState, useMemo, useState } from "react";
import { joinAction, type JoinState } from "@/app/join/actions";
import { pricing } from "@/constants/pricing";
import type { JoinableBatch } from "@/src/domains/joining/service";
import { PersonFields } from "./PersonFields";
import { Check } from "lucide-react";
import { FormSection, accentButtonClass } from "./Field";
import { APPROVAL_STEPS, OPEN_STEPS } from "./JoinPaths";

type ClassLevel = "class_11" | "class_12";
type Track = "standard" | "cuet";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function plansFor(c: ClassLevel, t: Track) {
  const course = pricing[c === "class_11" ? "class11" : "class12"];
  return (t === "cuet" ? course?.cuet : course?.standard) ?? [];
}

function Choice({
  name,
  value,
  checked,
  onChange,
  children,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col gap-1 rounded-[20px] border-[1.5px] p-4 pr-11 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest-800/40 ${
        checked ? "border-forest-800 bg-forest-50" : "border-line bg-surface hover:border-ink-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
      <span
        className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
          checked ? "border-forest-800 bg-forest-800 text-paper" : "border-ink-300 bg-surface"
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3.5} />}
      </span>
      {children}
    </label>
  );
}

export function JoinForm({
  batches,
  initialClass,
  initialTrack,
  initialPlan,
  workshopId,
}: {
  batches: JoinableBatch[];
  initialClass?: ClassLevel;
  initialTrack?: Track;
  initialPlan?: string;
  workshopId?: string;
}) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinAction, { status: "idle" });
  const [classLevel, setClassLevel] = useState<ClassLevel>(initialClass ?? "class_11");
  const [track, setTrack] = useState<Track>(initialTrack ?? "standard");
  const plans = plansFor(classLevel, track);
  const [planId, setPlanId] = useState<string>(
    initialPlan && plans.some((p) => p.id === initialPlan) ? initialPlan : plans.find((p) => p.popular)?.id ?? plans[0]?.id ?? ""
  );
  const classBatches = useMemo(() => batches.filter((b) => b.classLevel === classLevel), [batches, classLevel]);
  const [batchId, setBatchId] = useState<string>(classBatches[0]?.id ?? "");

  const plan = plans.find((p) => p.id === planId);
  const batch = classBatches.find((b) => b.id === batchId);
  const errors = state.status === "error" ? state.errors : {};

  function pickClass(c: ClassLevel) {
    setClassLevel(c);
    const nextPlans = plansFor(c, track);
    setPlanId(nextPlans.find((p) => p.popular)?.id ?? nextPlans[0]?.id ?? "");
    setBatchId(batches.find((b) => b.classLevel === c && b.seatsLeft !== 0)?.id ?? "");
  }
  function pickTrack(t: Track) {
    setTrack(t);
    const nextPlans = plansFor(classLevel, t);
    setPlanId(nextPlans.find((p) => p.popular)?.id ?? nextPlans[0]?.id ?? "");
  }

  return (
    <form action={action} noValidate className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-10">
        <input type="hidden" name="classLevel" value={classLevel} />
        {workshopId && <input type="hidden" name="workshopId" value={workshopId} />}

        <FormSection title="Course" step={1}>
          <div role="radiogroup" aria-label="Class" className="grid grid-cols-2 gap-3">
            {(["class_11", "class_12"] as const).map((c) => (
              <Choice key={c} name="_class" value={c} checked={classLevel === c} onChange={() => pickClass(c)}>
                <span className="font-semibold">{c === "class_11" ? "Class 11" : "Class 12"}</span>
              </Choice>
            ))}
          </div>
          <div role="radiogroup" aria-label="Track" className="grid grid-cols-2 gap-3">
            <Choice name="track" value="standard" checked={track === "standard"} onChange={() => pickTrack("standard")}>
              <span className="font-semibold">Boards</span>
              <span className="text-sm text-ink-500">CBSE psychology</span>
            </Choice>
            <Choice name="track" value="cuet" checked={track === "cuet"} onChange={() => pickTrack("cuet")}>
              <span className="font-semibold">Boards + CUET</span>
              <span className="text-sm text-ink-500">Adds CUET-UG prep</span>
            </Choice>
          </div>
        </FormSection>

        <FormSection title="Plan" step={2}>
          <div role="radiogroup" aria-label="Plan" className="grid gap-3 sm:grid-cols-2">
            {plans.map((p) => (
              <Choice key={p.id} name="planId" value={p.id} checked={planId === p.id} onChange={() => setPlanId(p.id)}>
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {p.popular && (
                    <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-bold text-ink-900">Popular</span>
                  )}
                </span>
                <span className="font-sans text-2xl font-semibold tracking-tight">{inr(p.price)}</span>
                <span className="text-sm text-ink-500">
                  {p.classes} classes{p.save ? ` · save ${inr(p.save)}` : ""}
                </span>
              </Choice>
            ))}
          </div>
          {errors.planId && <p className="text-[13px] font-medium text-rose-600">{errors.planId}</p>}
        </FormSection>

        <FormSection title="Batch" step={3}>
          {classBatches.length === 0 ? (
            <p className="rounded-[20px] border border-line bg-paper-deep p-4 text-ink-500">
              No {classLevel === "class_11" ? "Class 11" : "Class 12"} batch is open for joining right now. Please check
              back soon or come to a free workshop.
            </p>
          ) : (
            <div role="radiogroup" aria-label="Batch" className="grid gap-3">
              {classBatches.map((b) => {
                const full = b.seatsLeft === 0;
                return (
                  <Choice key={b.id} name="batchId" value={b.id} checked={batchId === b.id} onChange={() => setBatchId(b.id)} disabled={full}>
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{b.name}</span>
                      <span className="text-sm text-ink-500">
                        {full ? "Full" : b.seatsLeft !== null ? `${b.seatsLeft} seats left` : ""}
                      </span>
                    </span>
                    {b.schedule && <span className="text-sm text-ink-500">{b.schedule}</span>}
                    {b.teacherName && <span className="text-sm text-ink-500">With {b.teacherName}</span>}
                    <span
                      className={`mt-1 w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        b.joinMode === "open" ? "bg-mint text-forest-900" : "bg-lilac text-ink-900"
                      }`}
                    >
                      {b.joinMode === "open" ? "Pay now and join straight away" : "Request a seat, pay once approved"}
                    </span>
                  </Choice>
                );
              })}
            </div>
          )}
          {errors.batchId && <p className="text-[13px] font-medium text-rose-600">{errors.batchId}</p>}
        </FormSection>

        <PersonFields errors={errors} showClass={false} showParentEmail firstStep={4} />
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-col gap-5 rounded-[28px] bg-forest-900 p-6 text-paper sm:p-7">
          <h2 className="font-serif text-2xl">Your seat</h2>
          <dl className="flex flex-col gap-2.5 text-[15px]">
            <div className="flex justify-between gap-4"><dt className="text-paper/65">Course</dt><dd className="text-right">{classLevel === "class_11" ? "Class 11" : "Class 12"} · {track === "cuet" ? "Boards + CUET" : "Boards"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-paper/65">Plan</dt><dd className="text-right">{plan ? `${plan.name} · ${plan.classes} classes` : "Not chosen"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-paper/65">Batch</dt><dd className="text-right">{batch?.name ?? "Not chosen"}</dd></div>
          </dl>
          <div className="flex items-baseline justify-between border-t border-paper/15 pt-4">
            <span className="text-paper/65">Fee</span>
            <span className="font-sans text-[32px] font-semibold tracking-tight">{plan ? inr(plan.price) : "–"}</span>
          </div>

          {batch && (
            <div className="rounded-[20px] bg-paper/5 p-4">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-gold-400">What happens next</p>
              <ol className="flex flex-col gap-2 text-sm">
                {(batch.joinMode === "open" ? OPEN_STEPS : APPROVAL_STEPS).map((st, i) => (
                  <li key={st.label} className="flex items-center gap-2.5">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${i === 0 ? "bg-gold-500 text-ink-900" : "bg-paper/15 text-paper"}`}>
                      {i + 1}
                    </span>
                    <span className={i === 0 ? "font-semibold" : "text-paper/80"}>{st.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm text-paper/80">
            <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-gold-500" />
            <span>I’m a parent or guardian, or a parent knows about and agrees to this enrolment.</span>
          </label>
          {errors.consent && <p className="text-[13px] font-semibold text-gold-400">{errors.consent}</p>}
          {state.status === "error" && (state.message || Object.keys(errors).length > 0) && (
            <p role="alert" className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">
              {state.message ?? "Please fix the highlighted fields."}
            </p>
          )}
          <button type="submit" disabled={pending || !batch || !plan} className={accentButtonClass}>
            {pending ? "Sending…" : batch?.joinMode === "open" ? "Continue to payment" : "Request a seat"}
          </button>
          <p className="text-[13px] text-paper/65">
            {batch?.joinMode === "open"
              ? "You’ll pay securely with Razorpay on the next screen."
              : "Nothing to pay now. Once Dravina approves, we email you a payment link."}
          </p>
        </div>
      </aside>
    </form>
  );
}
