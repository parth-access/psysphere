import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { JoinableBatch } from "@/src/domains/joining/service";
import { Eyebrow } from "@/features/marketing/ui/Typography";
import { JoinForm } from "./JoinForm";
import { JoinPaths } from "./JoinPaths";

type Props = {
  batches: JoinableBatch[];
  initialClass?: "class_11" | "class_12";
  initialTrack?: "standard" | "cuet";
  initialPlan?: string;
  /** Set when the student arrives from a workshop's follow-up email. */
  workshopId?: string;
};

export function JoinView(props: Props) {
  const fromWorkshop = Boolean(props.workshopId);
  return (
    <div className="flex flex-col gap-12">
      <header className="flex max-w-2xl flex-col gap-4">
        <Eyebrow>{fromWorkshop ? "After the workshop" : "Join a batch"}</Eyebrow>
        <h1 className="font-serif text-[44px] leading-[1] sm:text-[60px]">
          {fromWorkshop ? (
            <>
              Thanks for coming. <em className="text-forest-800">Pick your batch.</em>
            </>
          ) : (
            <>
              Get your <em className="text-forest-800">seat.</em>
            </>
          )}
        </h1>
        <p className="text-lg text-ink-500">
          Choose your course, plan and batch. Batches are small, so some need Dravina’s approval before you pay.
        </p>
      </header>

      {fromWorkshop ? (
        <div className="flex items-center gap-4 rounded-[24px] bg-mint p-5">
          <Sparkles className="h-6 w-6 shrink-0 text-forest-800" aria-hidden="true" />
          <p className="text-[15px] text-ink-900">
            We’ll link this request to your workshop, so Dravina knows you’ve already been to a class.
          </p>
        </div>
      ) : (
        <JoinPaths current="direct" />
      )}

      <div id="form" className="scroll-mt-28">
        <JoinForm {...props} />
      </div>

      {!fromWorkshop && (
        <p className="text-center text-[15px] text-ink-500">
          Not sure yet?{" "}
          <Link href="/workshops" className="font-bold text-forest-800 underline decoration-gold-500 decoration-2 underline-offset-4">
            Try a free workshop first
          </Link>
          .
        </p>
      )}
    </div>
  );
}
