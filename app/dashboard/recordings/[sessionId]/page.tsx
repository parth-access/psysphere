import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classRecordings } from "@/db/schema/academic/classRecordings";
import { classSessions } from "@/db/schema/academic/classSessions";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { canAccessBatch } from "@/server/authorization/access";
import { isWatchable, timeLeftLabel } from "@/src/domains/recordings/limits";
import { settleRecordings } from "@/src/domains/recordings/service";
import { formatIST } from "@/lib/ids";

export const dynamic = "force-dynamic";

function Unavailable({ backHref }: { backHref: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Class recording" />
      <DashboardCard>
        <p className="text-sm text-ink-700">This recording isn’t available. Recordings are deleted 24 hours after they’re ready.</p>
        <Link href={backHref} className="mt-3 inline-flex min-h-9 items-center text-sm font-semibold text-forest-800 underline underline-offset-2">Back to classes</Link>
      </DashboardCard>
    </div>
  );
}

export default async function RecordingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  await settleRecordings();
  const { sessionId } = await params;
  const backHref = me.role === "student" ? "/dashboard/my-classes" : "/dashboard/classes";
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return <Unavailable backHref={backHref} />;

  const [row] = await db
    .select({ recording: classRecordings, session: classSessions })
    .from(classRecordings)
    .innerJoin(classSessions, eq(classSessions.id, classRecordings.sessionId))
    .where(eq(classRecordings.sessionId, sessionId));

  // Same answer whether the class doesn't exist or isn't theirs, and the file's address is only sent to people allowed to watch.
  if (!row || !isWatchable(row.recording) || !(await canAccessBatch(me, row.session.batchId))) return <Unavailable backHref={backHref} />;
  const { recording, session } = row;

  return (
    <div className="space-y-6">
      <PageHeader title={session.title} description={`${session.topicTitle} · ${formatIST(session.startsAt)}`} />
      <div className="relative overflow-hidden rounded-xl bg-ink-900">
        <iframe
          src={`https://drive.google.com/file/d/${recording.driveFileId}/preview`}
          title={`Recording of ${session.title}`}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="aspect-video w-full border-0"
        />
        {/* Covers Drive's pop-out button, which would open the file's Drive page. */}
        <div aria-hidden="true" className="absolute right-0 top-0 h-14 w-14" />
      </div>
      <p className="text-sm text-ink-700">
        Available until <strong className="font-semibold text-ink-900">{formatIST(recording.expiresAt)}</strong> ({timeLeftLabel(recording.expiresAt!)}). After that it’s deleted. This recording is for your batch only, so please don’t record or share it.
      </p>
      <Link href={backHref} className="inline-flex min-h-9 items-center text-sm font-semibold text-forest-800 underline underline-offset-2">Back to classes</Link>
    </div>
  );
}
