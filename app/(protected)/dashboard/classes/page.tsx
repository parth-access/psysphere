import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { db } from "@/db";
import { classSessions } from "@/db/schema/academic/classSessions";
import { batches } from "@/db/schema/core/batches";
import { eq, desc } from "drizzle-orm";
import { Plus, Video, Calendar as CalendarIcon, Clock, BookOpen } from "lucide-react";
import { createClassSessionAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  // 1. Fetch live class sessions joined with their parent batch
  const sessions = await db
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
    .innerJoin(batches, eq(classSessions.batchId, batches.id))
    .orderBy(desc(classSessions.startsAt));

  // 2. Fetch active batches to schedule sessions onto
  const batchesList = await db
    .select()
    .from(batches)
    .where(eq(batches.isActive, true));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Classes Schedule" 
        description="Schedule, host, and track live interactive digital whiteboarding lectures and doubt-clearing sessions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-serif font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-primary" />
            Scheduled Class Sessions ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl text-gray-500">
              <p className="text-sm font-medium">No live classes scheduled yet.</p>
              <p className="text-xs text-gray-400 mt-1">Schedule a session for an active student batch on the right panel.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sessions.map((cls) => {
                const formattedDate = new Date(cls.startsAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                });
                const formattedTime = new Date(cls.startsAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <DashboardCard key={cls.id} className="p-0 hover:border-brand-primary/10 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-900">{cls.title}</h3>
                          <StatusBadge status={cls.status as any} />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Topic: <strong className="font-medium">{cls.topicTitle}</strong></p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-primary/50"></span>
                            Cohort: {cls.batchName}
                          </span>
                          <span className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {formattedDate}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formattedTime}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full sm:w-auto flex items-center gap-3">
                        {cls.status !== "completed" && (
                          <a 
                            href={cls.meetingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto bg-brand-surface text-brand-primary border border-brand-primary/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary/10 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <Video className="w-4 h-4" />
                            Join Lecture
                          </a>
                        )}
                      </div>
                    </div>
                  </DashboardCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule Sidepanel Form */}
        <div className="space-y-6">
          <DashboardCard title="Schedule Lecture">
            {batchesList.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                <p className="font-medium">Please create an active batch cohort first before scheduling any live lectures.</p>
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

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Meeting Link (Meet/Zoom)</label>
                  <input 
                    type="url" 
                    name="meetingUrl" 
                    required 
                    defaultValue="https://meet.google.com/abc-defg-hij"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
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
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule Lecture
                  </button>
                </div>
              </form>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
