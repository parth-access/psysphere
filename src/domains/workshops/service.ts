import { db } from "@/db";
import { workshops, workshopRegistrations } from "@/db/schema/core/workshops";
import { and, asc, count, eq, gt, desc } from "drizzle-orm";
import { emailService } from "../email/service";
import { appUrl } from "../joining/tokens";
import type { ClassLevel } from "../joining/plans";
import {
  createCalendarEvent,
  findCalendarEventBySessionId,
  generateDeterministicUuid,
  getConnectedClient,
} from "@/server/integrations/google";

export class WorkshopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkshopError";
  }
}

const IST = "Asia/Kolkata";

/** "Sat, 24 Oct · 5:00 – 6:00 PM IST" */
export function formatWorkshopTime(startsAt: Date, endsAt: Date) {
  const day = startsAt.toLocaleDateString("en-IN", { timeZone: IST, weekday: "short", day: "numeric", month: "short" });
  const t = (d: Date) => d.toLocaleTimeString("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit", hour12: true });
  return `${day} · ${t(startsAt)} – ${t(endsAt)} IST`;
}

/* ------------------------------------------------------------------ */
/* Public                                                              */
/* ------------------------------------------------------------------ */

export async function listUpcomingWorkshops() {
  const rows = await db
    .select()
    .from(workshops)
    .where(and(eq(workshops.isPublished, true), gt(workshops.endsAt, new Date())))
    .orderBy(asc(workshops.startsAt));
  return Promise.all(rows.map(async (w) => ({ ...w, seatsLeft: await seatsLeft(w.id, w.capacity) })));
}

async function seatsLeft(workshopId: string, capacity: number | null) {
  if (capacity == null) return null;
  const [r] = await db.select({ n: count() }).from(workshopRegistrations).where(eq(workshopRegistrations.workshopId, workshopId));
  return Math.max(0, capacity - Number(r?.n ?? 0));
}

export async function getPublicWorkshop(id: string) {
  const [w] = await db
    .select()
    .from(workshops)
    .where(and(eq(workshops.id, id), eq(workshops.isPublished, true)))
    .limit(1);
  if (!w) return null;
  return { ...w, seatsLeft: await seatsLeft(w.id, w.capacity) };
}

export interface RegisterInput {
  workshopId: string;
  studentName: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  classLevel: ClassLevel;
}

export async function registerForWorkshop(input: RegisterInput) {
  const w = await getPublicWorkshop(input.workshopId);
  if (!w) throw new WorkshopError("This workshop isn't available.");
  if (w.endsAt < new Date()) throw new WorkshopError("This workshop has already happened.");

  const email = input.email.trim().toLowerCase();
  const [existing] = await db
    .select({ id: workshopRegistrations.id })
    .from(workshopRegistrations)
    .where(and(eq(workshopRegistrations.workshopId, w.id), eq(workshopRegistrations.email, email)))
    .limit(1);

  if (!existing && w.seatsLeft !== null && w.seatsLeft <= 0) {
    throw new WorkshopError("Sorry, this workshop is full.");
  }

  let registrationId = existing?.id;
  if (!existing) {
    const [row] = await db
      .insert(workshopRegistrations)
      .values({
        workshopId: w.id,
        studentName: input.studentName.trim(),
        email,
        phone: input.phone.trim(),
        parentName: input.parentName.trim(),
        parentPhone: input.parentPhone.trim(),
        classLevel: input.classLevel,
      })
      .onConflictDoNothing()
      .returning({ id: workshopRegistrations.id });
    registrationId = row?.id;
  }

  // (Re)send the confirmation either way, so a student who lost the email gets it again.
  await emailService.sendWorkshopRegistered(
    email,
    {
      studentName: input.studentName.trim(),
      workshopTitle: w.title,
      whenText: formatWorkshopTime(w.startsAt, w.endsAt),
      meetingUrl: w.meetingUrl,
    },
    registrationId
  );
  return { alreadyRegistered: !!existing };
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export async function listAllWorkshops() {
  const rows = await db
    .select({ workshop: workshops, registrations: count(workshopRegistrations.id) })
    .from(workshops)
    .leftJoin(workshopRegistrations, eq(workshopRegistrations.workshopId, workshops.id))
    .groupBy(workshops.id)
    .orderBy(desc(workshops.startsAt));
  return rows;
}

export async function getWorkshopWithRegistrations(id: string) {
  const [w] = await db.select().from(workshops).where(eq(workshops.id, id)).limit(1);
  if (!w) return null;
  const registrations = await db
    .select()
    .from(workshopRegistrations)
    .where(eq(workshopRegistrations.workshopId, id))
    .orderBy(asc(workshopRegistrations.createdAt));
  return { workshop: w, registrations };
}

export interface CreateWorkshopInput {
  title: string;
  description: string | null;
  classLevel: ClassLevel | null;
  startsAt: Date;
  endsAt: Date;
  capacity: number | null;
  createdBy: string;
}

export async function createWorkshop(input: CreateWorkshopInput) {
  if (!(await getConnectedClient())) {
    throw new WorkshopError("Connect Google Calendar in Settings first, so the workshop gets a Meet link.");
  }

  // Stable id so a retry never creates a second Calendar event.
  const id = generateDeterministicUuid(`workshop:${input.title}:${input.startsAt.getTime()}`);
  const [dupe] = await db.select({ id: workshops.id }).from(workshops).where(eq(workshops.id, id));
  if (dupe) return { id };

  const event =
    (await findCalendarEventBySessionId(id)) ??
    (await createCalendarEvent({
      sessionId: id,
      title: `Free workshop: ${input.title}`,
      batchName: "Saarthi Classes free workshop",
      topicTitle: input.description || input.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      teacherName: "Dravina Gupta",
    }));

  await db.insert(workshops).values({
    id,
    title: input.title,
    description: input.description,
    classLevel: input.classLevel,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    capacity: input.capacity,
    meetingUrl: event.meetUrl,
    googleEventId: event.eventId,
    createdBy: input.createdBy,
  });
  return { id };
}

export async function setWorkshopPublished(id: string, isPublished: boolean) {
  await db.update(workshops).set({ isPublished, updatedAt: new Date() }).where(eq(workshops.id, id));
}

export async function setAttendance(registrationId: string, attended: boolean) {
  await db
    .update(workshopRegistrations)
    .set({ attended, updatedAt: new Date() })
    .where(eq(workshopRegistrations.id, registrationId));
}

export async function sendWorkshopReminders(id: string) {
  const data = await getWorkshopWithRegistrations(id);
  if (!data) throw new WorkshopError("Workshop not found.");
  const { workshop: w, registrations } = data;
  const whenText = formatWorkshopTime(w.startsAt, w.endsAt);
  const results = await Promise.allSettled(
    registrations.map((r) =>
      emailService.sendWorkshopReminder(
        r.email,
        { studentName: r.studentName, workshopTitle: w.title, whenText, meetingUrl: w.meetingUrl },
        r.id
      )
    )
  );
  await db.update(workshops).set({ remindersSentAt: new Date() }).where(eq(workshops.id, id));
  return { sent: results.filter((r) => r.status === "fulfilled" && r.value.success).length, total: registrations.length };
}

/** After the workshop: invite registrants (optionally only those who attended) to join a batch. */
export async function sendJoinInvites(id: string, onlyAttended: boolean) {
  const data = await getWorkshopWithRegistrations(id);
  if (!data) throw new WorkshopError("Workshop not found.");
  const { workshop: w } = data;
  const targets = data.registrations.filter((r) => !onlyAttended || r.attended);
  const results = await Promise.allSettled(
    targets.map((r) =>
      emailService.sendWorkshopJoinInvite(
        r.email,
        {
          studentName: r.studentName,
          workshopTitle: w.title,
          joinUrl: appUrl(`/join?workshop=${w.id}&class=${r.classLevel}`),
        },
        r.id
      )
    )
  );
  await db.update(workshops).set({ joinInvitesSentAt: new Date() }).where(eq(workshops.id, id));
  return { sent: results.filter((r) => r.status === "fulfilled" && r.value.success).length, total: targets.length };
}
