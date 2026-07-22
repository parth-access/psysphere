import { cn } from "@/lib/utils";

type StatusType = "pending" | "approved" | "completed" | "cancelled" | "active" | "warning" | "scheduled" | "upcoming";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<StatusType, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const labels: Record<StatusType, string> = {
    pending: "Pending",
    approved: "Approved",
    completed: "Completed",
    cancelled: "Cancelled",
    active: "Active",
    warning: "Warning",
    scheduled: "Scheduled",
    upcoming: "Upcoming",
  };

  return (
    <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", styles[status], className)}>
      {labels[status]}
    </span>
  );
}
