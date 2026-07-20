"use client";

import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { MOCK_BATCHES } from "@/features/dashboard/mock/data";
import { Plus, Users, CalendarClock, User } from "lucide-react";

export default function BatchesPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Batches" 
        description="Manage your class batches and schedules."
        action={
          <button className="bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-hover transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Batch
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_BATCHES.map((batch) => (
          <DashboardCard key={batch.id} className="hover:border-brand-primary/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">{batch.name}</h3>
                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mt-2">
                  {batch.class}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{batch.studentsCount} Students</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CalendarClock className="w-4 h-4 text-gray-400" />
                <span>Next: {batch.nextClass}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>{batch.teacher}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover">View Details</button>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900">Edit</button>
            </div>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
