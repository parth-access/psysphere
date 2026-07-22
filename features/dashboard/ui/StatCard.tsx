import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]", className)}>
      <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
      <h4 className="text-3xl font-serif font-bold text-gray-900">{value}</h4>
    </div>
  );
}
