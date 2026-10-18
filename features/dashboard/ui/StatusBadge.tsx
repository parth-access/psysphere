import { cn } from "@/lib/utils";

type StatusType = 
  | "pending" | "approved" | "completed" | "cancelled" | "active" | "warning" | "scheduled" | "upcoming"
  | "paid" | "enrolled" | "declined"
  | "ENROLLED" | "ACTIVE" | "INACTIVE" | "ALUMNI";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status as StatusType;
  
  const styles: Partial<Record<StatusType, string>> = {
    pending: "bg-marigold-100 text-marigold-700 border-marigold-100",
    approved: "bg-sage-100 text-sage-600 border-sage-100",
    completed: "bg-sage-100 text-sage-600 border-sage-100",
    cancelled: "bg-rose-100 text-rose-600 border-rose-100",
    active: "bg-sage-100 text-sage-600 border-sage-100",
    warning: "bg-marigold-100 text-marigold-700 border-marigold-100",
    scheduled: "bg-ink-100 text-ink-700 border-ink-100",
    upcoming: "bg-ink-100 text-ink-700 border-ink-100",
    paid: "bg-ink-100 text-ink-700 border-ink-100",
    enrolled: "bg-sage-100 text-sage-600 border-sage-100",
    declined: "bg-rose-100 text-rose-600 border-rose-100",
    ENROLLED: "bg-sage-100 text-sage-600 border-sage-100",
    ACTIVE: "bg-sage-100 text-sage-600 border-sage-100",
    INACTIVE: "bg-paper text-ink-700 border-line",
    ALUMNI: "bg-ink-100 text-ink-700 border-ink-100",
  };

  const labels: Partial<Record<StatusType, string>> = {
    pending: "Pending",
    approved: "Awaiting payment",
    completed: "Completed",
    cancelled: "Cancelled",
    active: "Active",
    warning: "Warning",
    scheduled: "Scheduled",
    upcoming: "Upcoming",
    paid: "Paid",
    enrolled: "Enrolled",
    declined: "Declined",
    ENROLLED: "Enrolled",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ALUMNI: "Alumni",
  };

  const currentStyle = styles[normalizedStatus] || "bg-paper text-ink-700 border-line";
  const currentLabel = labels[normalizedStatus] || status;

  return (
    <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", currentStyle, className)}>
      {currentLabel}
    </span>
  );
}
