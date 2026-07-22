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
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden", className)}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white/50">
          {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
