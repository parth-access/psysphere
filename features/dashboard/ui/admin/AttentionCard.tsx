import Link from "next/link";
import { AlertTriangle, CalendarX, ChevronRight, CircleCheck, ClipboardCheck, Clock, Inbox, IndianRupee, UserPlus } from "lucide-react";
import type { AttentionItem } from "@/src/domains/admin/overview";

const ICONS: Record<AttentionItem["id"], typeof Inbox> = {
  approve: UserPlus,
  unpaid: IndianRupee,
  expired: Clock,
  provisioning: AlertTriangle,
  messages: Inbox,
  grading: ClipboardCheck,
  attendance: CalendarX,
};

export function AttentionCard({ items }: { items: AttentionItem[] }) {
  return (
    <section aria-labelledby="attention-title" className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <h2 id="attention-title" className="font-serif text-2xl text-ink-900">
          Needs you
        </h2>
        {items.length > 0 && (
          <span className="rounded-full bg-forest-800 px-2.5 py-0.5 text-xs font-bold text-paper">{items.length}</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-4 rounded-[20px] bg-mint p-5">
          <CircleCheck className="h-7 w-7 shrink-0 text-forest-800" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink-900">You’re all caught up.</p>
            <p className="text-sm text-ink-700">No requests, messages or marking waiting on you.</p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const Icon = ICONS[item.id];
            const warn = item.tone === "warning";
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-4 rounded-[20px] border border-transparent p-3 transition-colors hover:border-line hover:bg-paper"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${warn ? "bg-butter text-gold-700" : "bg-forest-50 text-forest-800"}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] text-ink-900">
                      <strong className="font-semibold">{item.count}</strong> {item.label}
                    </span>
                    {item.detail && (
                      <span className={`block text-sm ${warn ? "font-medium text-gold-700" : "text-ink-500"}`}>{item.detail}</span>
                    )}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-700" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
