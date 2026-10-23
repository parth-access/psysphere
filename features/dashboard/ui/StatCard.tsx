import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div className={cn("rounded-[24px] border border-line bg-surface p-5", className)}>
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 font-serif text-[clamp(26px,2.6vw,36px)] leading-none text-ink-900 tabular-nums break-words">{value}</p>
      {hint && <p className="mt-2 text-sm text-ink-500">{hint}</p>}
    </div>
  );
}
