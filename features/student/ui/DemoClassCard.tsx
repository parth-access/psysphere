import { MOCK_DEMO_CLASS } from "@/features/student/mock/data";
import { Video, Calendar, Clock, User, Monitor } from "lucide-react";

export function DemoClassCard() {
  const isJoinable = MOCK_DEMO_CLASS.status === "scheduled" && MOCK_DEMO_CLASS.link;

  return (
    <div className="bg-brand-primary text-white rounded-2xl p-6 lg:p-8 shadow-lg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white/90 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Upcoming Demo Class
            </div>
            <h2 className="text-2xl font-serif font-bold mb-1">{MOCK_DEMO_CLASS.subject}</h2>
            <p className="text-white/80 flex items-center gap-2">
              <User className="w-4 h-4" />
              with {MOCK_DEMO_CLASS.teacher}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              {MOCK_DEMO_CLASS.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 opacity-70" />
              {MOCK_DEMO_CLASS.time} ({MOCK_DEMO_CLASS.duration})
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 opacity-70" />
              {MOCK_DEMO_CLASS.platform}
            </div>
          </div>
        </div>

        <div>
          <button 
            disabled={!isJoinable}
            className={`w-full md:w-auto px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              isJoinable 
                ? "bg-white text-brand-primary hover:bg-gray-50 shadow-sm hover:-translate-y-0.5" 
                : "bg-white/10 text-white/50 cursor-not-allowed"
            }`}
          >
            <Video className="w-5 h-5" />
            Join Demo Class
          </button>
          {!isJoinable && (
            <p className="text-xs text-center text-white/60 mt-3">
              Link will be active 10 mins before class
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
