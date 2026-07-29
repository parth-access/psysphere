import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, BookOpen, ChevronRight, Inbox } from "lucide-react";

export default function DirectJoinPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F2] flex flex-col justify-between text-gray-900 font-sans pb-12" id="direct-join-container">
      {/* Upper header */}
      <div className="border-b border-[#E8E5E0] bg-white py-6 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-xl text-purple-950 tracking-wider">
            PsySphere
          </Link>
          <Link href="/contact" className="text-xs text-purple-700 font-semibold hover:underline">
            Contact Admissions
          </Link>
        </div>
      </div>

      {/* Main card */}
      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-[#E8E5E0] rounded-xl p-8 md:p-10 shadow-sm text-center">
          <div className="w-16 h-16 bg-purple-50 text-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">Cohorts are Selective</h1>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed max-w-md mx-auto">
            At PsySphere, we limit our Class 11 & 12 psychology cohorts to ensure high-engagement whiteboard mentorship and individualized grade progress trackers. Direct online registration is disabled.
          </p>

          <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-lg text-left mb-8 space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
              <div>
                <h4 className="font-semibold text-xs text-purple-950">Book a Live Whiteboard Demo</h4>
                <p className="text-gray-500 text-[11px] mt-0.5">Meet Dr. Aristha Sen and experience our visual, conceptual pedagogy firsthand.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
              <div>
                <h4 className="font-semibold text-xs text-purple-950">Secure Your Placement Token</h4>
                <p className="text-gray-500 text-[11px] mt-0.5">After your demo slot, you&apos;ll receive a secure individual token link to select packages.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
            >
              <span>Request a Demo Class</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-1 px-6 py-3 border border-[#E8E5E0] hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
            >
              <span>Inquire via Email</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Small footer */}
      <div className="text-center text-xs text-gray-400 max-w-md mx-auto px-6">
        Admissions inquiries: <span className="font-medium text-gray-500">psysphereclasses@gmail.com</span>
      </div>
    </div>
  );
}
