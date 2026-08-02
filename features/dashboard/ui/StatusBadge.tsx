import { cn } from "@/lib/utils";

type StatusType = 
  | "pending" | "approved" | "completed" | "cancelled" | "active" | "warning" | "scheduled" | "upcoming"
  | "LEAD" | "DEMO_BOOKED" | "DEMO_APPROVED" | "DEMO_SCHEDULED" | "DEMO_COMPLETED" | "ENROLLED" | "REJECTED" | "ACTIVE" | "INACTIVE" | "ALUMNI";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status as StatusType;
  
  const styles: Partial<Record<StatusType, string>> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    
    LEAD: "bg-gray-50 text-gray-700 border-gray-200",
    DEMO_BOOKED: "bg-amber-50 text-amber-700 border-amber-200",
    DEMO_APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
    DEMO_SCHEDULED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    DEMO_COMPLETED: "bg-purple-50 text-purple-700 border-purple-200",
    ENROLLED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INACTIVE: "bg-gray-50 text-gray-700 border-gray-200",
    ALUMNI: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const labels: Partial<Record<StatusType, string>> = {
    pending: "Pending",
    approved: "Approved",
    completed: "Completed",
    cancelled: "Cancelled",
    active: "Active",
    warning: "Warning",
    scheduled: "Scheduled",
    upcoming: "Upcoming",
    
    LEAD: "Lead",
    DEMO_BOOKED: "Demo Booked",
    DEMO_APPROVED: "Demo Approved",
    DEMO_SCHEDULED: "Demo Scheduled",
    DEMO_COMPLETED: "Demo Completed",
    ENROLLED: "Enrolled",
    REJECTED: "Rejected",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ALUMNI: "Alumni",
  };

  const currentStyle = styles[normalizedStatus] || "bg-gray-50 text-gray-700 border-gray-200";
  const currentLabel = labels[normalizedStatus] || status;

  return (
    <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", currentStyle, className)}>
      {currentLabel}
    </span>
  );
}
