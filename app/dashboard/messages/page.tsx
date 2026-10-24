import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema/core/contactMessages";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole, requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { PendingButton } from "@/features/shared/ui/PendingButton";

export const dynamic = "force-dynamic";

async function toggleHandled(formData: FormData) {
  "use server";
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("id"));
  const handled = formData.get("handled") === "1";
  await db
    .update(contactMessages)
    .set({ isHandled: handled, handledAt: handled ? new Date() : null, updatedAt: new Date() })
    .where(eq(contactMessages.id, id));
  revalidatePath("/dashboard/messages");
}

export default async function MessagesPage() {
  await enforcePageRole([ROLES.ADMIN]);
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  const open = rows.filter((r) => !r.isHandled).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description={`From the website contact form · ${open} to reply to`} />
      <DashboardCard>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-500">No messages yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((m) => (
              <li key={m.id} className={`flex flex-wrap items-start justify-between gap-4 py-4 ${m.isHandled ? "opacity-60" : ""}`}>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold text-ink-900">
                    {m.name} <span className="font-normal text-ink-500">· {m.topic}</span>
                  </p>
                  <p className="text-sm text-ink-500">
                    <a className="underline" href={`mailto:${m.email}`}>{m.email}</a>
                    {m.phone && <> · <a className="underline" href={`tel:${m.phone}`}>{m.phone}</a></>}
                    {" · "}
                    {m.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <p className="whitespace-pre-line text-[15px] text-ink-900">{m.message}</p>
                </div>
                <form action={toggleHandled}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="handled" value={m.isHandled ? "0" : "1"} />
                  <PendingButton className="min-h-9 rounded-lg border border-line px-3 text-xs font-semibold text-ink-900 hover:bg-paper">
                    {m.isHandled ? "Mark as open" : "Mark as replied"}
                  </PendingButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
