import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { ActionCard } from "@/features/dashboard/ui/ActionCard";
import { db } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { classSessions } from "@/db/schema/academic/classSessions";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  ExternalLink,
  BookOpen,
  CalendarPlus,
  Video,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  Inbox,
  FileText,
  HelpCircle,
  Plus,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Award
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const profile = await enforcePageRole([ROLES.TEACHER, ROLES.ADMIN]);
  const now = new Date();

  // 1. Fetch all class sessions for batches assigned to this teacher
  const allSessions = await db
    .select({
      id: classSessions.id,
      title: classSessions.title,
      topicTitle: classSessions.topicTitle,
      meetingUrl: classSessions.meetingUrl,
      startsAt: classSessions.startsAt,
      endsAt: classSessions.endsAt,
      status: classSessions.status,
      batchId: classSessions.batchId,
      batchName: batches.name,
    })
    .from(classSessions)
    .innerJoin(batches, eq(classSessions.batchId, batches.id))
    .where(eq(batches.teacherId, profile.id))
    .orderBy(classSessions.startsAt);

  // 2. Fetch active batches assigned to this teacher with student counts
  const activeBatches = await db
    .select({
      id: batches.id,
      name: batches.name,
      classLevel: batches.classLevel,
      academicYear: batches.academicYear,
      schedule: batches.schedule,
      isActive: batches.isActive,
      studentsCount: count(enrollments.id),
    })
    .from(batches)
    .leftJoin(
      enrollments,
      and(
        eq(batches.id, enrollments.batchId),
        eq(enrollments.status, "active")
      )
    )
    .where(
      and(
        eq(batches.isActive, true),
        eq(batches.teacherId, profile.id)
      )
    )
    .groupBy(batches.id)
    .orderBy(batches.name);

  // --- COMPUTE FIELDS ---

  // A. Determine greeting based on current local/server time
  const currentHour = now.getHours();
  let greeting = "Good Morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good Afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good Evening";
  }

  // B. Filter for today's scheduled classes
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const todayLectures = allSessions.filter((cls) => {
    const start = new Date(cls.startsAt);
    return start >= todayStart && start <= todayEnd;
  });

  // C. Find the nearest upcoming / live class
  const upcomingAndLive = allSessions.filter((cls) => {
    const endsAt = new Date(cls.endsAt);
    return endsAt > now && cls.status !== "completed" && cls.status !== "cancelled";
  });
  const nextClass = upcomingAndLive[0] || null;

  // D. Calculate hero dynamic messages
  const todayClassesCount = todayLectures.filter(cls => cls.status !== "cancelled").length;

  // Let's compute a warm, highly-contextual message
  let summaryText = "";
  if (nextClass) {
    const start = new Date(nextClass.startsAt);
    const isToday = start >= todayStart && start <= todayEnd;
    const isTomorrow = (() => {
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const tomorrowEnd = new Date(todayEnd);
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      return start >= tomorrowStart && start <= tomorrowEnd;
    })();

    const diffMs = start.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    const isLive = now >= start && now <= new Date(nextClass.endsAt);

    if (isLive) {
      summaryText = "You have a live lecture happening right now!";
    } else if (isToday) {
      if (diffMins > 0 && diffMins < 60) {
        summaryText = `Next lecture starts in ${diffMins} minute${diffMins === 1 ? "" : "s"}. You have ${todayClassesCount} lecture${todayClassesCount === 1 ? "" : "s"} scheduled for today.`;
      } else if (diffHours > 0 && diffHours <= 3) {
        summaryText = `Next lecture starts in ${diffHours} hour${diffHours === 1 ? "" : "s"}. You have ${todayClassesCount} lecture${todayClassesCount === 1 ? "" : "s"} scheduled for today.`;
      } else {
        const timeStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        summaryText = `Your next class is today at ${timeStr}. You have ${todayClassesCount} class${todayClassesCount === 1 ? "" : "es"} in total today.`;
      }
    } else if (isTomorrow) {
      const timeStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      const hour = start.getHours();
      let period = "evening";
      if (hour < 12) period = "morning";
      else if (hour < 17) period = "afternoon";
      summaryText = `Enjoy your free teaching day today! Your next lecture is scheduled for tomorrow ${period} at ${timeStr}.`;
    } else {
      const formattedDate = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const timeStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      summaryText = `Enjoy your preparation time today. Your next lecture is on ${formattedDate} at ${timeStr}.`;
    }
  } else {
    summaryText = "No classes scheduled today. Enjoy your preparation and teaching-free time.";
  }

  // Next Class layout metrics & countdown
  let isNextClassLive = false;
  let isNextClassStartsSoon = false;
  let nextClassStartsInMins = 0;
  let countdownText = "";

  if (nextClass) {
    const start = new Date(nextClass.startsAt);
    const endsAt = new Date(nextClass.endsAt);
    const diffMs = start.getTime() - now.getTime();
    nextClassStartsInMins = Math.ceil(diffMs / (1000 * 60));

    if (now >= start && now <= endsAt) {
      isNextClassLive = true;
      countdownText = "Live Now";
    } else if (nextClassStartsInMins > 0 && nextClassStartsInMins <= 15) {
      isNextClassStartsSoon = true;
      countdownText = `Starts in ${nextClassStartsInMins} mins`;
    } else {
      const isToday = start >= todayStart && start <= todayEnd;
      const isTomorrow = (() => {
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        const tomorrowEnd = new Date(todayEnd);
        tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
        return start >= tomorrowStart && start <= tomorrowEnd;
      })();

      const timeString = start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      });

      if (isToday) {
        countdownText = `Today at ${timeString}`;
      } else if (isTomorrow) {
        countdownText = `Tomorrow at ${timeString}`;
      } else {
        const dateString = start.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short"
        });
        countdownText = `${dateString} at ${timeString}`;
      }
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* SECTION 1: Welcome & Contextual Header */}
      <div id="teacher-hero-card" className="relative overflow-hidden p-8 rounded-3xl bg-radial from-stone-50 to-white border border-stone-200/60 shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-surface/40 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600 border border-stone-200/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Premium Teacher Workspace</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
              {greeting}, {profile.fullName.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-600 text-sm font-sans max-w-2xl leading-relaxed">
              {summaryText}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Link 
              href="/dashboard/classes" 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold bg-white border border-stone-200 hover:border-stone-300 text-stone-700 shadow-3xs transition-all cursor-pointer hover:bg-stone-50"
            >
              <Calendar className="w-4 h-4 text-stone-500" />
              Calendar View
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: Next Class Centerpiece (Highlighted prominently) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Next Scheduled Lecture</h2>
          {nextClass && (
            <span className="text-xs text-brand-primary font-medium flex items-center gap-1.5 bg-brand-surface/60 px-2.5 py-1 rounded-full border border-brand-primary/10">
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  isNextClassLive ? "bg-rose-400" : isNextClassStartsSoon ? "bg-amber-400" : "bg-brand-primary/40"
                )}></span>
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isNextClassLive ? "bg-rose-500" : isNextClassStartsSoon ? "bg-amber-500" : "bg-brand-primary"
                )}></span>
              </span>
              {countdownText}
            </span>
          )}
        </div>

        {!nextClass ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 bg-white border border-stone-150 rounded-3xl text-center shadow-3xs max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center border border-stone-100 text-stone-400 mb-4">
              <Calendar className="w-7 h-7" />
            </div>
            <p className="text-base font-serif font-bold text-stone-900">Enjoy your preparation time</p>
            <p className="text-xs text-stone-500 mt-1.5 max-w-xs leading-relaxed">
              No upcoming lectures are currently scheduled. Use this time to prepare materials or review student notes.
            </p>
            <Link 
              href="/dashboard/classes" 
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
            >
              Schedule a Lecture Now
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-white border border-stone-200/80 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />
            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Class Details */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-brand-surface text-brand-primary border border-brand-primary/15 rounded-full uppercase tracking-wider">
                      Cohort: {nextClass.batchName}
                    </span>
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5",
                      isNextClassLive 
                        ? "bg-rose-50 text-rose-700 border-rose-200" 
                        : isNextClassStartsSoon 
                        ? "bg-amber-50 text-amber-700 border-amber-200" 
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    )}>
                      {isNextClassLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                      {countdownText}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-serif font-bold text-stone-900 leading-snug">
                      {nextClass.title}
                    </h3>
                    <p className="text-stone-600 text-sm font-sans flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-stone-400 shrink-0" />
                      <span>Topic:</span>
                      <span className="font-semibold text-stone-800">{nextClass.topicTitle}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2 border-t border-stone-100/80 text-xs font-medium text-stone-500">
                    <span className="flex items-center gap-2 bg-stone-50/50 px-2.5 py-1 rounded-lg border border-stone-100">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      {new Date(nextClass.startsAt).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "short"
                      })}
                    </span>
                    <span className="flex items-center gap-2 bg-stone-50/50 px-2.5 py-1 rounded-lg border border-stone-100">
                      <Clock className="w-4 h-4 text-stone-400" />
                      {new Date(nextClass.startsAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })} - {new Date(nextClass.endsAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })} ({Math.round((new Date(nextClass.endsAt).getTime() - new Date(nextClass.startsAt).getTime()) / (1000 * 60))} mins)
                    </span>
                    <span className="flex items-center gap-1.5 text-teal-600 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100/60">
                      <Video className="w-4 h-4 text-teal-500" />
                      Meet Space Configured
                    </span>
                  </div>
                </div>

                {/* Join Call Action Panel */}
                <div className="shrink-0 flex flex-col justify-center sm:items-start md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0">
                  <a 
                    href={nextClass.meetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all w-full md:w-auto text-center whitespace-nowrap cursor-pointer shadow-sm hover:shadow-md",
                      isNextClassLive || isNextClassStartsSoon
                        ? "bg-brand-primary text-white hover:bg-brand-primary-hover ring-4 ring-brand-primary/10 scale-[1.03]"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/40"
                    )}
                  >
                    <Video className="w-4 h-4" />
                    {isNextClassLive ? "Launch Live Lecture" : isNextClassStartsSoon ? "Join Class Space" : "Prepare Lecture Room"}
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                  <p className="text-[11px] text-stone-400 text-center md:text-right w-full leading-normal max-w-[240px] mx-auto md:mr-0">
                    Syncs automatically with your synchronized Google Calendar event.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Core Workflows */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 3: Today's Teaching Schedule (Timeline) */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Today&apos;s Teaching Schedule</h2>
            
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-3xs">
              {todayLectures.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 text-stone-400 mx-auto mb-3">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-serif font-bold text-stone-800">No lectures scheduled for today</p>
                  {nextClass ? (
                    <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                      Enjoy your preparation day! Your next lecture is on {new Date(nextClass.startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at {new Date(nextClass.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.
                    </p>
                  ) : (
                    <p className="text-xs text-stone-400 mt-1">Enjoy your teaching-free day!</p>
                  )}
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-2 before:left-[11px] before:bottom-2 before:w-[2px] before:bg-stone-100/80">
                  {todayLectures.map((cls) => {
                    const startsAt = new Date(cls.startsAt);
                    const endsAt = new Date(cls.endsAt);
                    const diffMs = startsAt.getTime() - now.getTime();
                    const diffMins = Math.ceil(diffMs / (1000 * 60));

                    let status: "Completed" | "Live" | "Starting Soon" | "Upcoming" | "Cancelled" = "Upcoming";
                    let badgeStyle = "bg-stone-50 text-stone-600 border-stone-200";
                    let dotStyle = "border-stone-200 bg-white text-stone-400";
                    let cardOpacity = "opacity-100";

                    if (cls.status === "cancelled") {
                      status = "Cancelled";
                      badgeStyle = "bg-rose-50 text-rose-600 border-rose-100";
                      dotStyle = "border-rose-300 bg-rose-50 text-rose-400";
                      cardOpacity = "opacity-60";
                    } else if (cls.status === "completed" || now > endsAt) {
                      status = "Completed";
                      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100 font-medium";
                      dotStyle = "border-emerald-500 bg-emerald-50 text-emerald-600";
                      cardOpacity = "opacity-70";
                    } else if (now >= startsAt && now <= endsAt) {
                      status = "Live";
                      badgeStyle = "bg-rose-500 text-white border-transparent font-bold animate-pulse";
                      dotStyle = "border-rose-500 bg-rose-500 text-white animate-pulse";
                    } else if (diffMins > 0 && diffMins <= 15) {
                      status = "Starting Soon";
                      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
                      dotStyle = "border-amber-500 bg-amber-50 text-amber-600";
                    }

                    const timeString = startsAt.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div key={cls.id} className={cn("relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50/40 hover:bg-stone-50/80 border border-stone-150/40 hover:border-stone-200/60 transition-all", cardOpacity)}>
                        
                        {/* Timeline Node Icon/Dot */}
                        <div className={cn(
                          "absolute -left-[29px] sm:-left-[31px] top-4 sm:top-auto sm:my-auto w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10",
                          dotStyle
                        )}>
                          {status === "Completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : status === "Live" ? (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                        </div>

                        {/* Schedule Info */}
                        <div className="flex items-start gap-4">
                          <div className="text-left shrink-0 min-w-[65px] pt-0.5">
                            <span className="block text-xs uppercase tracking-wider font-semibold text-stone-400">Time</span>
                            <span className="block text-sm font-bold text-stone-800">{timeString}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 border border-stone-200/50 rounded-md uppercase tracking-wider">
                                {cls.batchName}
                              </span>
                              <span className={cn("text-[10px] px-2 py-0.5 border rounded-md font-semibold", badgeStyle)}>
                                {status === "Starting Soon" ? `Starting in ${diffMins}m` : status}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-stone-900">{cls.title}</h4>
                            <p className="text-xs text-stone-500">Topic: <span className="text-stone-700 font-medium">{cls.topicTitle}</span></p>
                          </div>
                        </div>

                        {/* Interactive Action or Finished State */}
                        <div className="sm:text-right w-full sm:w-auto pt-2 sm:pt-0 shrink-0">
                          {status === "Completed" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100/60 text-stone-500 rounded-lg text-xs font-semibold border border-stone-200/40">
                              ✓ Completed
                            </span>
                          ) : status === "Cancelled" ? (
                            <span className="inline-block px-3 py-1 bg-stone-100/40 text-stone-400 rounded-lg text-xs font-semibold">
                              Cancelled
                            </span>
                          ) : (
                            <a 
                              href={cls.meetingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={cn(
                                "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all w-full sm:w-auto cursor-pointer border",
                                status === "Live" || status === "Starting Soon"
                                  ? "bg-brand-primary text-white border-transparent hover:bg-brand-primary-hover shadow-3xs"
                                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                              )}
                            >
                              <Video className="w-3.5 h-3.5" />
                              {status === "Live" ? "Join Live" : "Open Space"}
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Action & Metadata */}
        <div className="space-y-8">
          
          {/* SECTION 5: Quick Actions & Future Workspaces */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Workspace Actions</h2>
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-3xs space-y-4">
              
              {/* Primary Active Actions */}
              <div className="space-y-2.5">
                <Link 
                  href="/dashboard/classes" 
                  className="flex items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100/80 border border-stone-150 rounded-2xl transition-all group cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-surface flex items-center justify-center text-brand-primary shrink-0 transition-transform group-hover:scale-105">
                    <CalendarPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-stone-800">Schedule New Lecture</span>
                    <span className="block text-[11px] text-stone-500">Plan next digital classroom lecture</span>
                  </div>
                </Link>

                <Link 
                  href="/dashboard/classes" 
                  className="flex items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100/80 border border-stone-150 rounded-2xl transition-all group cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-surface flex items-center justify-center text-brand-primary shrink-0 transition-transform group-hover:scale-105">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-stone-800">View All Classes</span>
                    <span className="block text-[11px] text-stone-500">Manage ongoing lectures history</span>
                  </div>
                </Link>
              </div>

              {/* Future Action Stubs / Placeholders */}
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1 mb-1.5">Future Workspaces</span>
                
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-100 text-stone-400/80 hover:bg-stone-50/40 transition-colors select-none">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-stone-400/60" />
                    <span className="text-xs font-medium">Open Teaching Notes</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded-md font-bold uppercase tracking-wider">Soon</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-100 text-stone-400/80 hover:bg-stone-50/40 transition-colors select-none">
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-stone-400/60" />
                    <span className="text-xs font-medium">View Student Questions</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded-md font-bold uppercase tracking-wider">Soon</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-100 text-stone-400/80 hover:bg-stone-50/40 transition-colors select-none">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-stone-400/60" />
                    <span className="text-xs font-medium">Create Assignment</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded-md font-bold uppercase tracking-wider">Soon</span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 4: My Coaching Batches (Enhanced design) */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">My Coaching Batches</h2>
            
            {activeBatches.length === 0 ? (
              <div className="text-center py-8 bg-white border border-stone-150 rounded-3xl text-stone-500 text-sm">
                You are not currently assigned to any active coaching batches.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeBatches.map((batch) => {
                  // Derive dynamic metadata:
                  // A. Find next lecture specifically for this batch
                  const batchUpcoming = allSessions.find(
                    s => s.batchId === batch.id && new Date(s.startsAt) > now && s.status !== "cancelled" && s.status !== "completed"
                  );
                  
                  let nextLectureDateStr = "No upcoming lecture";
                  if (batchUpcoming) {
                    const bStart = new Date(batchUpcoming.startsAt);
                    const isToday = bStart >= todayStart && bStart <= todayEnd;
                    const isTomorrow = (() => {
                      const tStart = new Date(todayStart);
                      tStart.setDate(tStart.getDate() + 1);
                      const tEnd = new Date(todayEnd);
                      tEnd.setDate(tEnd.getDate() + 1);
                      return bStart >= tStart && bStart <= tEnd;
                    })();

                    const timeStr = bStart.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                    if (isToday) {
                      nextLectureDateStr = `Today at ${timeStr}`;
                    } else if (isTomorrow) {
                      nextLectureDateStr = `Tomorrow at ${timeStr}`;
                    } else {
                      nextLectureDateStr = `${bStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at ${timeStr}`;
                    }
                  }

                  // B. Small progress indicator: Completed lectures vs total scheduled lectures
                  const batchSessions = allSessions.filter(s => s.batchId === batch.id && s.status !== "cancelled");
                  const totalLectures = batchSessions.length;
                  const completedLectures = batchSessions.filter(
                    s => s.status === "completed" || new Date(s.endsAt) < now
                  ).length;
                  const completionPercentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

                  return (
                    <div key={batch.id} className="p-6 bg-white border border-stone-200/80 rounded-3xl shadow-3xs space-y-4 hover:border-brand-primary/25 transition-all duration-300">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif font-bold text-lg text-stone-950">{batch.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md uppercase tracking-wider shrink-0">
                            {batch.classLevel.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">Academic Cohort: {batch.academicYear}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
                        <div className="space-y-0.5">
                          <span className="block text-stone-400 font-semibold uppercase tracking-wider text-[9px]">Active Students</span>
                          <span className="font-bold text-stone-800 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            {batch.studentsCount} Enrolled
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-stone-400 font-semibold uppercase tracking-wider text-[9px]">Next Live Lecture</span>
                          <span className="font-semibold text-stone-700 truncate block max-w-full">
                            {nextLectureDateStr}
                          </span>
                        </div>
                      </div>

                      {/* Small Progress Indicator */}
                      {totalLectures > 0 && (
                        <div className="pt-2.5 space-y-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-stone-500">
                            <span>Lectures Completed</span>
                            <span className="font-bold text-stone-800">{completedLectures} / {totalLectures} ({completionPercentage}%)</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-brand-primary h-full rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
