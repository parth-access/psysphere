import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { enrollments } from "@/db/schema/core/enrollments";
import { batches } from "@/db/schema/core/batches";
import { profiles } from "@/db/schema/core/profiles";
import { classSessions } from "@/db/schema/academic/classSessions";
import { assignments } from "@/db/schema/academic/assignments";
import { attendance } from "@/db/schema/academic/attendance";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { StudentTodaysFocus } from "@/features/dashboard/ui/StudentTodaysFocus";
import { 
  Calendar, 
  Clock, 
  ExternalLink,
  GraduationCap,
  Video,
  BookOpen,
  FileText,
  Award,
  HelpCircle,
  Activity,
  History,
  Bookmark,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { istHour, sameIstDay } from "@/lib/ids";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const profile = await enforcePageRole([ROLES.STUDENT, ROLES.ADMIN]);
  
  // 1. Find Student Profile
  const [studentProfile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.profileId, profile.id));

  let batchInfo: any = null;
  let allSessions: any[] = [];
  let studentAssignments: any[] = [];
  let studentAttendance: any[] = [];
  let studentAttempts: any[] = [];

  if (studentProfile) {
    // Fetch student attendance records
    studentAttendance = await db
      .select()
      .from(attendance)
      .where(eq(attendance.studentProfileId, profile.id));

    // Fetch student assignment attempts
    studentAttempts = await db
      .select()
      .from(assignmentAttempts)
      .where(eq(assignmentAttempts.studentProfileId, profile.id));

    // 2. Find Active Enrollment
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.studentProfileId, profile.id), eq(enrollments.status, "active")));

    if (enrollment) {
      // 3. Find Batch & Join with Teacher Profile
      const [batch] = await db
        .select({
          id: batches.id,
          name: batches.name,
          classLevel: batches.classLevel,
          academicYear: batches.academicYear,
          schedule: batches.schedule,
          isActive: batches.isActive,
          teacherName: profiles.fullName,
        })
        .from(batches)
        .leftJoin(profiles, eq(batches.teacherId, profiles.id))
        .where(eq(batches.id, enrollment.batchId));
      batchInfo = batch;

      if (batch) {
        // 4. Find ALL Scheduled and Scheduled-history Classes for this Batch
        allSessions = await db
          .select()
          .from(classSessions)
          .where(eq(classSessions.batchId, batch.id))
          .orderBy(classSessions.startsAt);

        // 5. Find Assignments for this Batch
        studentAssignments = await db
          .select()
          .from(assignments)
          .where(eq(assignments.batchId, batch.id))
          .orderBy(desc(assignments.dueAt));
      }
    }
  }

  const now = new Date();

  // Sort and split sessions
  const activeSessions = allSessions.filter(
    (cls) => cls.status !== "cancelled" && cls.status !== "completed" && new Date(cls.endsAt) > now
  );
  activeSessions.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const completedSessions = allSessions.filter(
    (cls) => cls.status === "completed" || (cls.status !== "cancelled" && new Date(cls.endsAt) <= now)
  );
  completedSessions.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const nextClass = activeSessions[0] || null;

  // Find pending upcoming assignments (due in the future and not yet submitted)
  const pendingAssignments = studentAssignments.filter((asm) => {
    const isFuture = new Date(asm.dueAt) > now;
    const hasSubmitted = studentAttempts.some(
      (attempt) => attempt.assignmentId === asm.id && (attempt.status === "submitted" || attempt.status === "graded" || attempt.submittedAt)
    );
    return isFuture && !hasSubmitted;
  });
  pendingAssignments.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  // Derive contextual information for Hero
  const firstName = profile.fullName ? profile.fullName.split(" ")[0] : "Student";
  const hour = istHour(now);
  let greeting = "Good Morning";
  let greetingEmoji = "👋";
  if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
    greetingEmoji = "👋";
  } else if (hour >= 17) {
    greeting = "Good Evening";
    greetingEmoji = "🌙";
  }

  let heroContextText = "";
  if (nextClass) {
    const startsAt = new Date(nextClass.startsAt);
    const endsAt = new Date(nextClass.endsAt);
    const diffMs = startsAt.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / (1000 * 60));

    if (now >= startsAt && now <= endsAt) {
      heroContextText = "You have a live Psychology lecture running right now!";
    } else if (diffMins > 0 && diffMins <= 60) {
      heroContextText = `Your next Psychology lecture starts in ${diffMins} minute${diffMins === 1 ? "" : "s"}.`;
    } else {
      const isToday = sameIstDay(startsAt, now);
      const isTomorrow = sameIstDay(startsAt, new Date(now.getTime() + 86400000));
      const timeStr = startsAt.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
      if (isToday) {
        heroContextText = `Your next Psychology lecture starts today at ${timeStr}.`;
      } else if (isTomorrow) {
        heroContextText = `Your next Psychology lecture starts tomorrow at ${timeStr}.`;
      } else {
        const dayStr = startsAt.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", weekday: "long" });
        heroContextText = `Your next Psychology lecture is scheduled for ${dayStr} at ${timeStr}.`;
      }
    }
  } else {
    heroContextText = "Enjoy your free study day. Perfect time to review previous notes or explore core topics.";
  }

  // Next Lecture Card layout countdown label
  let nextClassCountdown = "";
  let isNextClassLive = false;
  if (nextClass) {
    const startsAt = new Date(nextClass.startsAt);
    const endsAt = new Date(nextClass.endsAt);
    const diffMs = startsAt.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / (1000 * 60));

    if (now >= startsAt && now <= endsAt) {
      nextClassCountdown = "Live Now";
      isNextClassLive = true;
    } else if (diffMins > 0 && diffMins <= 60) {
      nextClassCountdown = `Starts in ${diffMins} mins`;
    } else {
      const isToday = sameIstDay(startsAt, now);
      const isTomorrow = sameIstDay(startsAt, new Date(now.getTime() + 86400000));
      const timeStr = startsAt.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
      if (isToday) {
        nextClassCountdown = `Today at ${timeStr}`;
      } else if (isTomorrow) {
        nextClassCountdown = `Tomorrow at ${timeStr}`;
      } else {
        const dayStr = startsAt.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" });
        nextClassCountdown = `${dayStr} at ${timeStr}`;
      }
    }
  }

  // Formatter for Deadlines
  const getDeadlineLabel = (dueAtStr: string) => {
    const dueAt = new Date(dueAtStr);
    const diffMs = dueAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (sameIstDay(dueAt, now)) {
      return "Due Today";
    }
    const tomorrow = new Date(now.getTime() + 86400000);
    if (sameIstDay(dueAt, tomorrow)) {
      return "Due Tomorrow";
    }

    if (diffDays > 1 && diffDays <= 6) {
      const dayOfWeek = dueAt.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", weekday: "long" });
      return `Due ${dayOfWeek}`;
    }

    return `Due ${dueAt.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}`;
  };

  // Progress metrics
  const attendedCount = studentAttendance.filter(a => a.status === "present" || a.status === "late").length;
  const totalAttendanceMarked = studentAttendance.length;
  const attendancePercent = totalAttendanceMarked > 0 
    ? Math.round((attendedCount / totalAttendanceMarked) * 100) 
    : null;

  const submittedAssignmentsCount = studentAttempts.filter(
    (a) => a.status === "submitted" || a.status === "graded" || a.submittedAt
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-4">
      
      {/* 1. HERO SECTION */}
      <div id="hero-greeting-card" className="relative overflow-hidden bg-white border border-line/80 rounded-2xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-surface/40 rounded-full blur-3xl -z-10" />
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-deep rounded-full text-xs font-semibold text-ink-700 border border-line/40">
            <span>🎓 Student Workspace</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink-900 tracking-tight">
            {greeting}, {firstName} {greetingEmoji}
          </h1>
          <p className="text-sm font-medium text-ink-700 leading-relaxed">
            {heroContextText}
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Core Workflows (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. TODAY'S FOCUS */}
          <StudentTodaysFocus 
            nextClassTitle={nextClass?.title}
            nextClassTopic={nextClass?.topicTitle}
            firstAssignmentTitle={pendingAssignments[0]?.title}
            lastCompletedClassTitle={completedSessions[0]?.title}
          />

          {/* 3. NEXT LECTURE */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-widest px-1">Next Scheduled Lecture</h2>
            {!nextClass ? (
              <div className="flex flex-col items-center justify-center py-8 px-6 bg-white border border-line rounded-2xl text-center h-[180px]">
                <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center border border-line text-ink-500 mb-2.5">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-sm font-serif font-bold text-ink-900">Enjoy your free preparation time</p>
                <p className="text-[11px] text-ink-500 mt-1 max-w-xs leading-normal">
                  No upcoming lectures are scheduled. Perfect time to revise previous lessons or read ahead!
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden bg-radial from-stone-50 to-white border-2 border-brand-primary/20 rounded-2xl p-6 transition-all duration-300 ">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-surface/30 rounded-full blur-2xl -z-10" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-black px-2.5 py-1 bg-brand-primary text-white rounded-md uppercase tracking-wider">
                        Next Lecture
                      </span>
                      <span className={`px-2.5 py-1 text-[9px] font-bold rounded-md border uppercase tracking-wider ${
                        isNextClassLive 
                          ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse" 
                          : "bg-marigold-100 text-gold-700 border-marigold-100"
                      }`}>
                        {nextClassCountdown}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-paper-deep text-ink-700 rounded-md uppercase tracking-wider">
                        {batchInfo?.name || "Psychology Batch"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-xl text-ink-900 leading-snug">{nextClass.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500 pt-1">
                        <span className="flex items-center gap-1">
                          <span className="text-ink-500">Topic:</span>
                          <strong className="font-semibold text-ink-700">{nextClass.topicTitle}</strong>
                        </span>
                        {batchInfo?.teacherName && (
                          <span className="flex items-center gap-1 border-l border-line pl-4">
                            <span className="text-ink-500">Teacher:</span>
                            <span className="font-medium text-ink-700">{batchInfo.teacherName}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 pt-2 border-t border-line/60">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-ink-500" />
                        <span>{new Date(nextClass.startsAt).toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="text-ink-300">•</span>
                        <span>{Math.round((new Date(nextClass.endsAt).getTime() - new Date(nextClass.startsAt).getTime()) / 60000)} mins</span>
                      </span>
                      <span className="flex items-center gap-1 text-sage-600 font-semibold border-l border-line pl-4">
                        <Video className="w-3.5 h-3.5 text-sage-600" />
                        Google Meet Link Ready
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    <a 
                      href={nextClass.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white hover:bg-brand-primary-hover rounded-xl text-xs font-bold transition-all hover:shadow-lg cursor-pointer transform hover:scale-102"
                    >
                      <Video className="w-4 h-4" />
                      Join Lecture
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. UPCOMING DEADLINES */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-widest px-1">Upcoming Deadlines</h2>
            {pendingAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 px-6 bg-paper/50 border border-line rounded-2xl text-center h-[100px]">
                <p className="text-xs font-medium text-ink-500">No upcoming deadlines.</p>
                <p className="text-[10px] text-ink-500 mt-0.5">You are completely caught up with your psychological studies!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingAssignments.slice(0, 4).map((asm) => (
                  <div key={asm.id} className="p-4 bg-white border border-line/60 rounded-2xl hover:border-brand-primary/20 hover:shadow-3xs transition-all space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] bg-brand-surface text-brand-primary px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-brand-primary/10">
                        {getDeadlineLabel(asm.dueAt)}
                      </span>
                      <span className="text-[10px] font-semibold text-ink-500">
                        {asm.maxMarks} Max Marks
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-ink-900 line-clamp-1">{asm.title}</h4>
                    <p className="text-[11px] text-ink-500 line-clamp-2 leading-relaxed">{asm.instructions}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-500 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-ink-300" />
                      <span>Due: {new Date(asm.dueAt).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. LECTURE TIMELINE */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-widest px-1">Active Scheduled Lectures</h2>
            {activeSessions.length === 0 ? (
              <div className="text-center py-10 bg-paper/40 border border-dashed border-line rounded-2xl">
                <p className="text-xs font-medium text-ink-500">No scheduled sessions active.</p>
                <p className="text-[10px] text-ink-500 mt-0.5">Perfect time to check your study notes or reference sheets!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((cls) => {
                  const startsAt = new Date(cls.startsAt);
                  const endsAt = new Date(cls.endsAt);
                  const durationMins = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);
                  const isLive = now >= startsAt && now <= endsAt;

                  return (
                    <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-line/60 rounded-2xl hover:border-brand-primary/10 hover:shadow-3xs transition-all gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isLive 
                              ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse font-extrabold"
                              : "bg-paper-deep text-ink-700 border border-line/60"
                          }`}>
                            {isLive ? "Live Now" : "Upcoming"}
                          </span>
                          <span className="text-[10px] font-semibold text-ink-500">
                            {batchInfo?.name}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-ink-900 leading-snug">{cls.title}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                          <span className="text-ink-500">Topic: <strong className="font-semibold text-ink-700">{cls.topicTitle}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-ink-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-ink-300" />
                            {startsAt.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-ink-300" />
                            {startsAt.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })} ({durationMins}m)
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <a 
                          href={cls.meetingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isLive 
                              ? "bg-brand-primary text-white hover:bg-brand-primary-hover "
                              : "bg-paper text-ink-700 hover:bg-paper-deep border border-line/60"
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          {isLive ? "Join Live" : "Join Call"}
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Collapsible / Elegant Lecture History */}
          {completedSessions.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Lecture History ({completedSessions.length})
              </span>
              <div className="bg-white border border-line/60 rounded-2xl p-5 space-y-3">
                {completedSessions.slice(0, 3).map((cls) => {
                  const startsAt = new Date(cls.startsAt);
                  return (
                    <div key={cls.id} className="flex items-center justify-between py-2.5 border-b border-line last:border-0 last:pb-0 first:pt-0 gap-4">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-ink-900 truncate">{cls.title}</h4>
                        <p className="text-[10px] text-ink-500 mt-0.5 truncate">Topic: {cls.topicTitle}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-block text-[9px] font-bold bg-paper-deep text-ink-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Completed
                        </span>
                        <p className="text-[10px] text-ink-500 mt-1">{startsAt.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. STUDY RESOURCES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-widest">Study Resources</h2>
              <span className="text-[10px] font-bold text-ink-500">Digital Library</span>
            </div>
            
            <div className="bg-white border border-line/80 rounded-2xl p-6 space-y-6">
              {/* Category Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Lecture Notes", count: "0", icon: FileText, bg: "bg-ink-100 text-ink-700 border-ink-100" },
                  { name: "Syllabus PDFs", count: "0", icon: Bookmark, bg: "bg-teal-50/40 text-teal-600 border-teal-100" },
                  { name: "Class Slides", count: "0", icon: BookOpen, bg: "bg-marigold-100 text-gold-700 border-marigold-100" },
                  { name: "Practice Qs", count: "0", icon: Award, bg: "bg-ink-100 text-ink-700 border-ink-300" }
                ].map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <div key={i} className={`p-4 rounded-2xl border flex flex-col items-start gap-2.5 hover:bg-paper/50 transition-colors cursor-pointer group ${cat.bg}`}>
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-ink-900 truncate">{cat.name}</span>
                        <span className="block text-[10px] text-ink-500 font-medium mt-0.5">{cat.count} resources published</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resources Empty State */}
              <div className="text-center py-8 border border-dashed border-line rounded-2xl bg-paper/40">
                <p className="text-xs text-ink-500 font-semibold">No study material published yet.</p>
                <p className="text-[10px] text-ink-500 mt-1 max-w-xs mx-auto leading-normal">
                  Your instructor hasn&apos;t added worksheets or notes to your batch yet. Check back soon!
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Action & Metadata (1/3 width) */}
        <div className="space-y-8">
          
          {/* 7. PROGRESS OVERVIEW */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-widest px-1">Learning Progress</h2>
            <div className="bg-white border border-line/80 rounded-2xl p-6 space-y-5">
              
              <div className="space-y-4">
                {/* Metr 1: Lectures Attended */}
                <div className="flex items-center justify-between py-1 border-b border-line pb-3">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-ink-500">Lectures Attended</span>
                    <span className="block text-sm font-bold text-ink-900">{attendedCount} Session{attendedCount === 1 ? "" : "s"}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-paper flex items-center justify-center text-ink-500 border border-line">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>

                {/* Metr 2: Attendance % */}
                {attendancePercent !== null && (
                  <div className="space-y-2 border-b border-line pb-3">
                    <div className="flex justify-between items-center">
                      <span className="block text-xs font-semibold text-ink-500">Attendance Rate</span>
                      <span className="block text-xs font-bold text-ink-900">{attendancePercent}%</span>
                    </div>
                    <div className="w-full bg-paper-deep rounded-full h-1.5 overflow-hidden">
                      <div className="bg-brand-primary h-full rounded-full" style={{ width: `${attendancePercent}%` }} />
                    </div>
                  </div>
                )}

                {/* Metr 3: Assignments Submitted */}
                <div className="flex items-center justify-between py-1 border-b border-line pb-3">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-ink-500">Assignments Completed</span>
                    <span className="block text-sm font-bold text-ink-900">{submittedAssignmentsCount} Homework{submittedAssignmentsCount === 1 ? "" : "s"}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-paper flex items-center justify-center text-ink-500 border border-line">
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                {/* Metr 4: Current Batch Cohort */}
                {batchInfo && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Your Academic Batch</span>
                      <p className="text-xs font-bold text-ink-900 leading-snug">{batchInfo.name}</p>
                      <span className="inline-block px-2 py-0.5 bg-brand-surface text-brand-primary border border-brand-primary/10 text-[9px] font-bold rounded-md uppercase mt-1">
                        {batchInfo.classLevel.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-0.5">Primary Instructor</span>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-ink-700">
                        <GraduationCap className="w-4 h-4 text-ink-500" />
                        <span>{batchInfo.teacherName || "Pending Instructor"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line text-[11px]">
                      <div>
                        <span className="block text-ink-500 font-semibold uppercase text-[8px] tracking-wider">Academic Year</span>
                        <span className="font-bold text-ink-700">{batchInfo.academicYear}</span>
                      </div>
                      <div>
                        <span className="block text-ink-500 font-semibold uppercase text-[8px] tracking-wider">Weekly Schedule</span>
                        <span className="font-bold text-ink-700 truncate block">{batchInfo.schedule || "Regular schedule"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 9. QUICK ACTIONS SIDEBAR */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-widest px-1">Workspace Actions</h2>
            <div className="bg-white border border-line/80 rounded-2xl p-5 space-y-3.5">
              
              {/* Primary Workspace Links */}
              <div className="flex flex-col gap-2">
                {nextClass ? (
                  <a 
                    href={nextClass.meetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 bg-brand-surface/40 hover:bg-brand-surface/70 border border-brand-primary/10 rounded-xl transition-all group font-sans text-xs font-bold text-brand-primary"
                  >
                    <span className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-brand-primary" />
                      Join Next Lecture
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 bg-paper border border-line rounded-xl text-ink-500 text-xs font-bold cursor-not-allowed select-none">
                    <span className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-ink-300" />
                      No Lecture Active
                    </span>
                  </div>
                )}

                <Link 
                  href="/dashboard/classes" 
                  className="flex items-center justify-between px-4 py-3 bg-paper hover:bg-paper-deep/80 border border-line rounded-xl transition-all group text-left font-sans text-xs font-bold text-ink-900 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-primary" />
                    View All Lectures
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-500 group-hover:text-ink-900 transition-colors" />
                </Link>
              </div>

              <div className="pt-3 border-t border-line space-y-2">
                <Link href="/dashboard/my-classes" className="flex min-h-11 items-center justify-between rounded-xl border border-line px-4 text-sm font-medium text-ink-900 hover:bg-paper">My classes & attendance<ChevronRight className="h-4 w-4 text-ink-500" aria-hidden="true" /></Link>
                <Link href="/dashboard/assignments" className="flex min-h-11 items-center justify-between rounded-xl border border-line px-4 text-sm font-medium text-ink-900 hover:bg-paper">Assignments & results<ChevronRight className="h-4 w-4 text-ink-500" aria-hidden="true" /></Link>
                <Link href="/dashboard/materials" className="flex min-h-11 items-center justify-between rounded-xl border border-line px-4 text-sm font-medium text-ink-900 hover:bg-paper">Study material<ChevronRight className="h-4 w-4 text-ink-500" aria-hidden="true" /></Link>
                <Link href="/dashboard/my-payments" className="flex min-h-11 items-center justify-between rounded-xl border border-line px-4 text-sm font-medium text-ink-900 hover:bg-paper">Fees & receipts<ChevronRight className="h-4 w-4 text-ink-500" aria-hidden="true" /></Link>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

