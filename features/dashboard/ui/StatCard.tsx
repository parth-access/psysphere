import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

/** Stat tile: sentence-case label, sans value, optional hint. Numbers stay in the UI sans, not the display serif. */
export function StatCard({ label, value, hint, icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-[24px] border border-line bg-surface p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-50 text-forest-800 [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 break-words font-sans text-[clamp(26px,2.4vw,32px)] font-semibold leading-none tracking-tight text-ink-900">{value}</p>
      {hint && <p className="mt-2 text-sm text-ink-500">{hint}</p>}
    </div>
  );
}
