import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { db } from "@/db";
import { classSessions } from "@/db/schema/academic/classSessions";
import { batches } from "@/db/schema/core/batches";
import { eq, desc, isNotNull, and } from "drizzle-orm";
import { Plus, Video, Calendar as CalendarIcon, Clock, BookOpen, AlertTriangle, ExternalLink } from "lucide-react";
import { createClassSessionAction } from "./actions";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { getConnectedClient } from "@/server/integrations/google";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const profile = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER]);

  // 1. Fetch live class sessions joined with their parent batch
  // Admins see all classes; teachers only see classes for their assigned batches
  const sessionsConditions = [];

  if (profile.role === "teacher") {
    sessionsConditions.push(eq(batches.teacherId, profile.id));
  }

  const sessionsQuery = db
    .select({
      id: classSessions.id,
      title: classSessions.title,
      topicTitle: classSessions.topicTitle,
      meetingUrl: classSessions.meetingUrl,
      startsAt: classSessions.startsAt,
      endsAt: classSessions.endsAt,
      status: classSessions.status,
      batchName: batches.name,
    })
    .from(classSessions)
    .innerJoin(batches, eq(classSessions.batchId, batches.id));

  if (sessionsConditions.length > 0) {
    sessionsQuery.where(and(...sessionsConditions));
  }

  const sessions = await sessionsQuery.orderBy(desc(classSessions.startsAt));

  // 2. Fetch active batches to schedule sessions onto
  // Admins can schedule for any batch with an assigned teacher; teachers only for their assigned batches
  const batchesConditions = [eq(batches.isActive, true)];

  if (profile.role === "teacher") {
    batchesConditions.push(eq(batches.teacherId, profile.id));
  } else {
    batchesConditions.push(isNotNull(batches.teacherId));
  }

  const batchesList = await db
    .select()
    .from(batches)
    .where(and(...batchesConditions));

  // 3. Query centralized Google integration status
  const googleConnection = await getConnectedClient();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Classes Schedule" 
        description={profile.role === "admin" 
          ? "Schedule, host, and track live interactive digital whiteboarding lectures and doubt-clearing sessions globally."
          : "Schedule and host interactive live lessons for your assigned batch cohorts."
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Subsection 1: Active & Upcoming Lectures */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                </span>
                Active &amp; Upcoming Lectures
              </span>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                {sessions.filter(cls => cls.status !== "cancelled" && cls.status !== "completed" && new Date(cls.endsAt) > new Date()).length}
              </span>
            </h2>

            {(() => {
              const now = new Date();
              const activeSessions = sessions.filter(cls => {
                const endsAt = new Date(cls.endsAt);
                return cls.status !== "cancelled" && cls.status !== "completed" && endsAt > now;
              });

              if (activeSessions.length === 0) {
                return (
                  <div className="text-center py-10 px-4 bg-white border border-stone-150 rounded-2xl text-stone-500 shadow-3xs">
                    <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                    <p className="text-sm font-semibold text-stone-800">No active or upcoming classes</p>
                    <p className="text-xs text-stone-500 mt-1">
                      {profile.role === "admin" 
                        ? "Create a session for an active cohort using the schedule panel."
                        : "No lectures on your immediate horizon. Feel free to plan one!"
                      }
                    </p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-4">
                  {activeSessions.map((cls) => {
                    const startsAt = new Date(cls.startsAt);
                    const endsAt = new Date(cls.endsAt);
                    const diffMs = startsAt.getTime() - now.getTime();
                    const diffMins = Math.ceil(diffMs / (1000 * 60));

                    let contextualStatus: "Upcoming" | "Starts Soon" | "Live" = "Upcoming";
                    let badgeStyle = "bg-stone-50 text-stone-600 border-stone-200";
                    let buttonText = "Join Call";
                    let buttonStyle = "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60";

                    if (now >= startsAt && now <= endsAt) {
                      contextualStatus = "Live";
                      badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse";
                      buttonText = "Join Live Class";
                      buttonStyle = "bg-brand-primary text-white hover:bg-brand-primary-hover border-transparent shadow-sm scale-102";
                    } else if (diffMins > 0 && diffMins <= 15) {
                      contextualStatus = "Starts Soon";
                      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
                      buttonText = "Join Now";
                      buttonStyle = "bg-brand-primary text-white hover:bg-brand-primary-hover border-transparent shadow-sm";
                    }

                    const durationMins = Math.round((endsAt.getTime() - startsAt.getTime()) / (1000 * 60));

                    return (
                      <DashboardCard key={cls.id} className="p-0 hover:border-brand-primary/10 transition-all duration-300 hover:shadow-xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-surface text-brand-primary border border-brand-primary/10 rounded-md uppercase tracking-wider">
                                {cls.batchName}
                              </span>
                              <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider", badgeStyle)}>
                                {contextualStatus === "Starts Soon" ? `Starts Soon (${diffMins}m)` : contextualStatus}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">{cls.title}</h3>
                              <p className="text-xs text-stone-600 mt-1 flex items-center gap-1.5">
                                <span className="text-stone-400">Topic:</span>
                                <span className="font-semibold text-stone-700">{cls.topicTitle}</span>
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-500 pt-1.5 border-t border-stone-50">
                              <span className="flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
                                {startsAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                {startsAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} ({durationMins} mins)
                              </span>
                              <span className="flex items-center gap-1 text-teal-600 font-medium">
                                <Video className="w-3.5 h-3.5 text-teal-500" />
                                Meet Configured
                              </span>
                            </div>
                          </div>
                          
                          <div className="w-full sm:w-auto shrink-0">
                            <a 
                              href={cls.meetingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={cn(
                                "w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer",
                                buttonStyle
                              )}
                            >
                              <Video className="w-4 h-4" />
                              {buttonText}
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          </div>
                        </div>
                      </DashboardCard>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Subsection 2: Completed & Past Lectures */}
          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between border-t border-stone-100 pt-6">
              <span>Completed &amp; Past History</span>
              <span className="text-xs bg-stone-50 text-stone-400 px-2 py-0.5 rounded-full">
                {sessions.filter(cls => cls.status === "cancelled" || cls.status === "completed" || new Date(cls.endsAt) <= new Date()).length}
              </span>
            </h2>

            {(() => {
              const now = new Date();
              const pastSessions = sessions.filter(cls => {
                const endsAt = new Date(cls.endsAt);
                return cls.status === "cancelled" || cls.status === "completed" || endsAt <= now;
              });

              if (pastSessions.length === 0) {
                return null;
              }

              return (
                <div className="flex flex-col gap-4 opacity-75">
                  {pastSessions.slice(0, 10).map((cls) => {
                    const startsAt = new Date(cls.startsAt);
                    const endsAt = new Date(cls.endsAt);
                    const isCancelled = cls.status === "cancelled";
                    const durationMins = Math.round((endsAt.getTime() - startsAt.getTime()) / (1000 * 60));

                    return (
                      <div key={cls.id} className="bg-stone-50/50 border border-stone-150/60 rounded-2xl p-5 hover:bg-stone-50 hover:border-stone-200 transition-colors">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-500 rounded-md uppercase tracking-wider">
                                {cls.batchName}
                              </span>
                              {isCancelled ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-500 border border-rose-100 uppercase tracking-wider">
                                  Cancelled
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                                  Completed
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="font-serif font-bold text-base text-stone-700">{cls.title}</h4>
                              <p className="text-xs text-stone-500">Topic: <span className="text-stone-600 font-medium">{cls.topicTitle}</span></p>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {startsAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {startsAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} ({durationMins}m)
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-400 rounded-lg text-xs font-semibold">
                              {isCancelled ? "Cancelled" : "✓ Finished"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {pastSessions.length > 10 && (
                    <p className="text-center text-xs text-stone-400 font-medium italic pt-2">
                      Showing latest 10 finished sessions.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

        </div>

        {/* Schedule Sidepanel Form */}
        <div className="space-y-6">
          <DashboardCard title="Schedule Lecture">
            {batchesList.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500 p-2">
                <p className="font-medium text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                  {profile.role === "admin"
                    ? "Please create an active batch cohort and assign an instructor before scheduling any live lectures."
                    : "You are not currently assigned to any active batch cohorts. Please contact the administrator to assign you to a batch."
                  }
                </p>
              </div>
            ) : (
              <form action={createClassSessionAction} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Target Batch Cohort</label>
                  <select 
                    name="batchId" 
                    required 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  >
                    {batchesList.map((batch) => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Class/Lecture Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    placeholder="e.g. Cognitive Psychology Intro" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Lesson Topic</label>
                  <input 
                    type="text" 
                    name="topicTitle" 
                    required 
                    placeholder="e.g. Memory structures and processing" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>

                {/* Meet integration alert badge */}
                <div className="bg-[#FAF8F5] border border-gray-100 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
                    <Video className="w-4 h-4 shrink-0" />
                    <span>Google Meet Video-Conference</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    A secure Google Calendar event and unique Google Meet conference room link will be automatically generated and synced upon lecture scheduling.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Date</label>
                    <input 
                      type="date" 
                      name="date" 
                      required 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Starts At</label>
                    <input 
                      type="time" 
                      name="time" 
                      required 
                      defaultValue="18:00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Duration (Minutes)</label>
                  <select 
                    name="duration" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none"
                  >
                    <option value="60">60 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="90">90 Minutes</option>
                    <option value="120">120 Minutes</option>
                  </select>
                </div>

                <div className="pt-2">
                  {!googleConnection ? (
                    <div className="space-y-3">
                      <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          {profile.role === "admin" ? (
                            <>
                              <strong>Google integration is not connected.</strong> Please connect and authorize the system Google account first in the{" "}
                              <a href="/dashboard/settings" className="underline hover:text-amber-900 font-bold">
                                Settings page
                              </a>{" "}
                              before scheduling live lectures.
                            </>
                          ) : (
                            <>
                              <strong>Google Calendar service is currently offline.</strong> Please contact your administrator to configure the system Google account before scheduling classes.
                            </>
                          )}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        disabled
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4 text-gray-300" />
                        Schedule Lecture (Offline)
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Schedule Lecture
                    </button>
                  )}
                </div>
              </form>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
