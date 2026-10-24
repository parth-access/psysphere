import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function DashboardCard({ title, children, className, action }: DashboardCardProps) {
  return (
    <section className={cn("overflow-hidden rounded-[24px] border border-line bg-surface", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          {title && <h2 className="font-serif text-xl text-ink-900">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
