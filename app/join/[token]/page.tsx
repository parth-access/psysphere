import { prospectTokenService } from "@/src/domains/admissions/tokens";
import Link from "next/link";
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar
} from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function JoinTokenPage({ params }: PageProps) {
  const { token } = await params;
  const admission = await prospectTokenService.verifyToken(token);

  if (!admission) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center p-6" id="invalid-token-container">
        <div className="max-w-md w-full bg-white border border-[#E8E5E0] rounded-xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            This secure registration link has expired or is invalid. Please contact the admissions office at <span className="font-semibold text-[#7C3AED]">psysphereclasses@gmail.com</span> to request a new payment link.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const isEnrolled = admission.status === "ENROLLED";
  const classFormatted = admission.class === "class_11" || admission.class === "class11" ? "Class 11" : "Class 12";

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-gray-900 font-sans pb-16" id="join-container">
      {/* Decorative top border */}
      <div className="h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800"></div>

      <div className="max-w-4xl mx-auto px-6 mt-12">
        
        {/* Breadcrumb / Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/experience/${token}`} className="text-xs text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1">
            <span>← Back to Student Dashboard Preview</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit Secure Session</span>
          </div>
        </div>

        {isEnrolled ? (
          <div className="bg-white border border-[#E8E5E0] rounded-xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Enrollment Already Complete!</h1>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed max-w-lg mx-auto">
              Hi <strong>{admission.studentName}</strong>, your account has already been successfully provisioned and is active. Please check your inbox for the welcome setup email to configure your password and access your dashboard.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#7C3AED] text-white font-medium text-sm rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm"
            >
              Go to Portal Sign-In
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Left: Invoice & Package summary */}
            <div className="md:col-span-3 space-y-8">
              <div className="bg-white border border-[#E8E5E0] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span>Enrollment Summary</span>
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                    <span className="text-gray-500">Student Name</span>
                    <span className="font-semibold text-gray-800">{admission.studentName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                    <span className="text-gray-500">Academic Cohort</span>
                    <span className="font-semibold text-gray-800">{classFormatted} Psychology</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                    <span className="text-gray-500">Selected Program</span>
                    <span className="font-semibold text-gray-800">{admission.program}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                    <span className="text-gray-500">Assigned Instructor</span>
                    <span className="font-semibold text-gray-800">Dr. Aristha Sen</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E8E5E0] flex justify-between items-center bg-purple-50/40 p-4 rounded-lg">
                  <div>
                    <span className="text-xs text-purple-700 font-semibold uppercase tracking-wider block">Total Amount Due</span>
                    <span className="text-xs text-gray-400">All taxes and study materials included</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-serif font-bold text-purple-950">
                      ₹{admission.price || "Contact Support"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure payment explanation */}
              <div className="bg-white border border-[#E8E5E0] rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>How do I pay?</span>
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Our official integrated payment gateway is currently in the provisioning stage. No card details or payments can be input or completed on this page at this time.
                </p>
                <p className="text-xs text-gray-600 leading-relaxed mt-2 font-medium">
                  To complete your payment and instantly unlock your student account:
                </p>
                <ul className="text-xs text-gray-600 list-disc pl-5 mt-2 space-y-1">
                  <li>Our admissions team will send a separate secure billing invoice directly to <span className="font-semibold">{admission.email}</span>.</li>
                  <li>Once payment is verified, the administrator will instantly trigger your account activation.</li>
                </ul>
              </div>

            </div>

            {/* Right: Payment boundary screen */}
            <div className="md:col-span-2">
              <div className="bg-white border border-[#E8E5E0] rounded-xl p-6 shadow-sm sticky top-6">
                <div className="w-12 h-12 bg-purple-50 text-[#7C3AED] rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Payment Pending</h3>
                <p className="text-gray-500 text-xs mb-6 leading-relaxed">
                  The client-side registration checkout is disabled. All enrollments require database-level verified payments.
                </p>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg mb-6">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 text-[11px]">Awaiting Verification</h4>
                      <p className="text-amber-800 text-[10px] mt-0.5 leading-relaxed">
                        Your registration has been initiated on our servers. Once our administrators verify your off-line billing or direct transfer, your student profile will automatically publish.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full py-3 bg-gray-100 text-gray-400 font-semibold text-xs rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Checkout Integration Suspended</span>
                  </button>
                  
                  <a
                    href="mailto:psysphereclasses@gmail.com"
                    className="w-full py-3 border border-[#E8E5E0] hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Contact Admissions
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
