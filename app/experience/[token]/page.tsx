import { prospectTokenService } from "@/src/domains/admissions/tokens";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  BookOpen, 
  Video, 
  Award, 
  Calendar, 
  ArrowRight, 
  Lock, 
  Clock, 
  AlertCircle,
  CheckCircle,
  FileText,
  UserCheck
} from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ProspectExperiencePage({ params }: PageProps) {
  const { token } = await params;
  
  // Verify token securely on the server
  const admission = await prospectTokenService.verifyToken(token);

  if (!admission) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center p-6" id="invalid-token-container">
        <div className="max-w-md w-full bg-white border border-[#E8E5E0] rounded-xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            The experience preview link you followed is invalid or has expired. Experience links remain active for 7 days after demo completion.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const classFormatted = admission.class === "class_11" || admission.class === "class11" ? "Class 11" : "Class 12";

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-gray-900 font-sans pb-12" id="experience-dashboard">
      {/* Top Banner */}
      <div className="bg-[#7C3AED] text-white py-3 px-4 text-center text-sm font-medium tracking-wide shadow-sm flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span>You are viewing the <strong>PsySphere Student Portal Preview</strong> for <strong>{admission.studentName}</strong></span>
        <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Preview Mode</span>
      </div>

      <header className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E5E0]">
        <div>
          <div className="flex items-center gap-2 text-[#7C3AED] font-semibold text-sm mb-1 uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Welcome, {admission.studentName}</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Your Personalized PsySphere Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Authorized student preview space for <strong>{classFormatted} Psychology</strong> ({admission.program})
          </p>
        </div>

        <div>
          <Link
            href={`/join/${token}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <span>Continue to Enrollment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Notice of Preview */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-5 mb-10 flex gap-4">
          <div className="text-amber-600 shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 text-sm">Interactive Features Disabled</h4>
            <p className="text-amber-800 text-xs mt-1 leading-relaxed">
              This space lets you preview the state-of-the-art PsySphere portal features. To unlock live classes, assignment submission, graded test analysis, and active whiteboard participation, please finalize your enrollment.
            </p>
          </div>
        </div>

        {/* Dashboard Grid Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main 2-Column Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Live Interactive Class Portal */}
            <div className="bg-white border border-[#E8E5E0] rounded-xl overflow-hidden shadow-sm" id="live-class-preview">
              <div className="p-6 border-b border-[#E8E5E0] flex items-center justify-between bg-purple-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-[#7C3AED] rounded-lg">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-gray-900">Live Virtual Classroom</h3>
                    <p className="text-xs text-gray-500">Real-time vector whiteboard and audio</p>
                  </div>
                </div>
                <span className="text-[11px] bg-red-100 text-red-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Live Soon
                </span>
              </div>
              <div className="p-8 text-center bg-gray-50/50">
                <div className="max-w-md mx-auto py-4">
                  <p className="text-gray-700 text-sm font-semibold mb-2">
                    Class Topic: Introduction to Cognitive Psychology
                  </p>
                  <p className="text-xs text-gray-500 mb-6">
                    Weekly live lectures are directly hosted within the whiteboard module.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 font-medium text-xs rounded-lg cursor-not-allowed">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked — Activate Account to Join</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Core Curriculum & Interactive Chapters */}
            <div className="bg-white border border-[#E8E5E0] rounded-xl overflow-hidden shadow-sm" id="curriculum-preview">
              <div className="p-6 border-b border-[#E8E5E0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-gray-900">Study Materials & Notes</h3>
                    <p className="text-xs text-gray-500">Premium curated boards, summaries, and CUET practice questions</p>
                  </div>
                </div>
              </div>
              <div className="p-6 divide-y divide-gray-100">
                <div className="py-4 flex justify-between items-center first:pt-0">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800">Chapter 1: Intelligence & Aptitude</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Revision Sheets + 150 CUET Practice MCQ Quiz</p>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded">
                    Sample PDF Available after Setup
                  </span>
                </div>
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800">Chapter 2: Self and Personality</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Dr. Sen&apos;s Whiteboard Annotation Summary</p>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
                <div className="py-4 flex justify-between items-center last:pb-0">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800">Chapter 3: Meeting Life Challenges</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Stress Coping Strategies Video Summary</p>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Modules */}
          <div className="space-y-8">
            
            {/* Academic Status Card */}
            <div className="bg-white border border-[#E8E5E0] rounded-xl p-6 shadow-sm" id="academic-status-preview">
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>Academic Status</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Assigned Batch</span>
                  <span className="text-xs font-semibold text-gray-800">PsySphere {classFormatted}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Live Attendance</span>
                  <span className="text-xs font-semibold text-gray-400 italic">Not Enrolled Yet</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Completed Assignments</span>
                  <span className="text-xs font-semibold text-gray-400 italic">0 submissions</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500">Average Score</span>
                  <span className="text-xs font-semibold text-gray-400 italic">No grading history</span>
                </div>
              </div>
            </div>

            {/* Program Summary CTA Panel */}
            <div className="bg-purple-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden" id="continue-panel">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-800/50 rounded-full translate-x-12 -translate-y-12 shrink-0"></div>
              <div className="relative z-10">
                <h3 className="font-serif font-bold text-xl mb-2">Ready to secure your seat?</h3>
                <p className="text-purple-200 text-xs mb-6 leading-relaxed">
                  Join PsySphere&apos;s high-performance interactive cohort. Gain instant full access to study rooms, premium mock tests, and weekly live whiteboard interactions.
                </p>
                
                <Link
                  href={`/join/${token}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white text-purple-900 font-semibold text-sm rounded-lg hover:bg-purple-50 transition-colors shadow-sm"
                >
                  <span>Lock In Enrollment</span>
                  <ArrowRight className="w-4 h-4 text-purple-900" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
