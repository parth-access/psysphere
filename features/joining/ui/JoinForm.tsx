"use client";

import { useActionState, useMemo, useState } from "react";
import { joinAction, type JoinState } from "@/app/join/actions";
import { pricing } from "@/constants/pricing";
import type { JoinableBatch } from "@/src/domains/joining/service";
import { PersonFields } from "./PersonFields";
import { Field, FormSection, primaryButtonClass } from "./Field";

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
      className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink-700/40 ${
        checked ? "border-ink-900 bg-ink-100" : "border-line bg-surface hover:border-ink-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
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

        <FormSection title="Course">
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

        <FormSection title="Plan">
          <div role="radiogroup" aria-label="Plan" className="grid gap-3 sm:grid-cols-2">
            {plans.map((p) => (
              <Choice key={p.id} name="planId" value={p.id} checked={planId === p.id} onChange={() => setPlanId(p.id)}>
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {p.popular && (
                    <span className="rounded-full bg-marigold-500 px-2.5 py-0.5 text-xs font-semibold text-ink-900">Popular</span>
                  )}
                </span>
                <span className="font-serif text-2xl font-semibold">{inr(p.price)}</span>
                <span className="text-sm text-ink-500">
                  {p.classes} classes{p.save ? ` · save ${inr(p.save)}` : ""}
                </span>
              </Choice>
            ))}
          </div>
          {errors.planId && <p className="text-[13px] font-medium text-rose-600">{errors.planId}</p>}
        </FormSection>

        <FormSection title="Batch">
          {classBatches.length === 0 ? (
            <p className="rounded-xl border border-line bg-paper-deep p-4 text-ink-500">
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
                    <span className="text-sm text-ink-500">
                      {b.teacherName ? `With ${b.teacherName} · ` : ""}
                      {b.joinMode === "open" ? "Pay now and join instantly" : "Request a seat, pay once approved"}
                    </span>
                  </Choice>
                );
              })}
            </div>
          )}
          {errors.batchId && <p className="text-[13px] font-medium text-rose-600">{errors.batchId}</p>}
        </FormSection>

        <PersonFields errors={errors} showClass={false} showParentEmail />
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-col gap-4 rounded-2xl bg-ink-900 p-6 text-paper">
          <h2 className="font-serif text-xl font-semibold">Summary</h2>
          <dl className="flex flex-col gap-2 text-[15px]">
            <div className="flex justify-between gap-4"><dt className="text-ink-300">Course</dt><dd className="text-right">{classLevel === "class_11" ? "Class 11" : "Class 12"} · {track === "cuet" ? "Boards + CUET" : "Boards"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-300">Plan</dt><dd className="text-right">{plan ? `${plan.name} · ${plan.classes} classes` : "—"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-300">Batch</dt><dd className="text-right">{batch?.name ?? "—"}</dd></div>
          </dl>
          <div className="flex items-baseline justify-between border-t border-ink-700 pt-4">
            <span className="text-ink-300">Fee</span>
            <span className="font-serif text-3xl font-semibold">{plan ? inr(plan.price) : "—"}</span>
          </div>
          <label className="flex items-start gap-3 text-sm text-ink-300">
            <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-marigold-500" />
            <span>I’m a parent/guardian, or a parent knows about and agrees to this enrollment.</span>
          </label>
          {errors.consent && <p className="text-[13px] font-medium text-marigold-500">{errors.consent}</p>}
          {state.status === "error" && (state.message || Object.keys(errors).length > 0) && (
            <p role="alert" className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">
              {state.message ?? "Please fix the highlighted fields."}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !batch || !plan}
            className={`${primaryButtonClass} !bg-marigold-500 !text-ink-900 hover:!bg-marigold-100`}
          >
            {pending ? "Sending…" : batch?.joinMode === "open" ? "Continue to payment" : "Request a seat"}
          </button>
          <p className="text-[13px] text-ink-300">
            {batch?.joinMode === "open"
              ? "You’ll pay securely with Razorpay on the next screen."
              : "No payment now. Once Dravina approves, you’ll get a payment link by email."}
          </p>
        </div>
      </aside>
    </form>
  );
}
