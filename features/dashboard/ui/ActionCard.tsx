import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Link from "next/link";

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function ActionCard({ icon, title, onClick, href, className }: ActionCardProps) {
  const content = (
    <>
      <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center text-brand-primary">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900">{title}</span>
    </>
  );

  const cardClasses = cn(
    "flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full text-center cursor-pointer",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cardClasses}>
      {content}
    </button>
  );
}
