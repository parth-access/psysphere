import { MOCK_JOURNEY_STAGES } from "@/features/student/mock/data";
import { Check, CircleDot, Circle } from "lucide-react";

export function JourneyTimeline() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-8">
      <h3 className="font-serif font-bold text-lg text-gray-900 mb-6">Upcoming Journey</h3>
      
      <div className="relative">
        <div className="absolute top-2 bottom-2 left-[11px] w-px bg-gray-100"></div>
        <div className="space-y-6">
          {MOCK_JOURNEY_STAGES.map((stage, index) => {
            const isCompleted = stage.status === "completed";
            const isCurrent = stage.status === "current";
            const isUpcoming = stage.status === "upcoming";

            return (
              <div key={stage.id} className="relative flex gap-4 items-start group">
                <div className="relative z-10 bg-white">
                  {isCompleted && (
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="w-6 h-6 rounded-full border-2 border-brand-primary bg-white text-brand-primary flex items-center justify-center">
                      <CircleDot className="w-4 h-4" />
                    </div>
                  )}
                  {isUpcoming && (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-white text-gray-300 flex items-center justify-center">
                      <Circle className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 pt-0.5 pb-2">
                  <p className={`text-sm font-medium ${
                    isCompleted ? "text-gray-900" : 
                    isCurrent ? "text-brand-primary font-semibold" : 
                    "text-gray-500"
                  }`}>
                    {stage.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stage.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
