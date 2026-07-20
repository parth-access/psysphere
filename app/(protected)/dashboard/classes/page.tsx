"use client";

import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { MOCK_CLASSES } from "@/features/dashboard/mock/data";
import { Plus, Video, Calendar as CalendarIcon, Clock } from "lucide-react";

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Classes Schedule" 
        description="View and manage upcoming live classes."
        action={
          <button className="bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-hover transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Class
          </button>
        }
      />

      <div className="flex flex-col gap-4">
        {MOCK_CLASSES.map((cls) => (
          <DashboardCard key={cls.id} className="p-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{cls.topic}</h3>
                  <StatusBadge status={cls.status as any} />
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-primary/50"></span>
                    {cls.batch}
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {cls.time.split(',')[0]}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {cls.time.split(',')[1]?.trim() || "4:00 PM"}
                  </span>
                </div>
              </div>
              
              <div className="w-full sm:w-auto flex items-center gap-3">
                {cls.status !== "completed" && (
                  <button className="w-full sm:w-auto bg-brand-surface text-brand-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary/10 transition-colors flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </button>
                )}
                <button className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">
                  Details
                </button>
              </div>
            </div>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
