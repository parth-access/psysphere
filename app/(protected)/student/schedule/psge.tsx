import { MOCK_DEMO_CLASS } from "@/features/student/mock/data";
import { Video, Calendar, Clock, User, Monitor } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">View your upcoming classes and timetable.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Upcoming Demo Class</h3>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">Scheduled</span>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{MOCK_DEMO_CLASS.subject}</h2>
                <p className="text-gray-500 flex items-center gap-2 mt-1 text-sm">
                  <User className="w-4 h-4" />
                  with {MOCK_DEMO_CLASS.teacher}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {MOCK_DEMO_CLASS.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {MOCK_DEMO_CLASS.time} ({MOCK_DEMO_CLASS.duration})
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  {MOCK_DEMO_CLASS.platform}
                </div>
              </div>
            </div>

            <div>
              <button className="w-full md:w-auto px-6 py-3 bg-brand-primary text-white rounded-xl font-medium transition-colors hover:bg-brand-primary-hover flex items-center justify-center gap-2">
                <Video className="w-5 h-5" />
                Join Class
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-12 text-center mt-6">
        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Your Full Schedule</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Once your admission is confirmed, your complete weekly timetable will appear here.
        </p>
      </div>
    </div>
  );
}
