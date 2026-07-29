import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  getDemoRequestReceivedTemplate,
  getNewLeadInternalTemplate,
  getDemoApprovedTemplate,
  getDemoScheduledTemplate,
  getDemoRejectedTemplate,
  getPostDemoConversionTemplate,
  getStudentInvitationTemplate,
  getTeacherActivationTemplate
} from "@/src/domains/email/templates";

export const dynamic = "force-dynamic";

const TEMPLATES = [
  { id: "demo-received", name: "Demo Request Received (Student)" },
  { id: "new-lead-admin", name: "New Lead Request (Internal Admin)" },
  { id: "demo-approved", name: "Demo Request Approved" },
  { id: "demo-scheduled", name: "Demo Class Scheduled" },
  { id: "demo-rescheduled", name: "Demo Class Rescheduled" },
  { id: "demo-rejected", name: "Demo Request Rejected" },
  { id: "post-demo-conversion", name: "Post-Demo Conversion" },
  { id: "student-welcome", name: "Welcome Student & Password Set-up" },
  { id: "teacher-activation", name: "Welcome Teacher & Activation" }
];

// Development-only mock fixtures
const FIXTURES = {
  studentName: "Aarav Mehta",
  parentName: "Rajesh Mehta",
  email: "aarav.mehta@example.com",
  phone: "+91 98123 45678",
  classLevel: "class_12",
  programType: "CUET Prep + Boards Comprehensive",
  preferredDate: "30 July 2026",
  preferredTime: "5:00 PM",
  notes: "Looking to focus on Cognitive Psychology and Memory chapters as priority.",
  admissionId: "dev-admission-uuid-1234",
  demoDate: "30 July 2026",
  demoTime: "5:00 PM - 6:00 PM",
  teacherName: "Dr. Aristha Sen",
  googleMeetUrl: "https://meet.google.com/abc-defg-hij",
  previewUrl: "http://localhost:3000/experience/dev-preview-token-123",
  joinUrl: "http://localhost:3000/join/dev-join-token-123",
  studentId: "PSY-2026-0042",
  passwordSetupUrl: "https://psysphere.classes/reset-password?token=dev-supabase-invite-token-123"
};

export default async function EmailPreviewPage({ params }: { params: Promise<{ template: string }> }) {
  // 1. Enforce development-only safety
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { template } = await params;

  let htmlContent = "";
  let errorMsg = "";

  try {
    switch (template) {
      case "demo-received":
        htmlContent = getDemoRequestReceivedTemplate({
          studentName: FIXTURES.studentName,
          classLevel: FIXTURES.classLevel,
          programType: FIXTURES.programType,
          preferredDate: FIXTURES.preferredDate,
          preferredTime: FIXTURES.preferredTime
        });
        break;
      case "new-lead-admin":
        htmlContent = getNewLeadInternalTemplate({
          admissionId: FIXTURES.admissionId,
          studentName: FIXTURES.studentName,
          parentName: FIXTURES.parentName,
          email: FIXTURES.email,
          phone: FIXTURES.phone,
          classLevel: FIXTURES.classLevel,
          programType: FIXTURES.programType,
          preferredDate: FIXTURES.preferredDate,
          preferredTime: FIXTURES.preferredTime,
          notes: FIXTURES.notes
        });
        break;
      case "demo-approved":
        htmlContent = getDemoApprovedTemplate({
          studentName: FIXTURES.studentName,
          email: FIXTURES.email,
          demoDate: FIXTURES.demoDate,
          teacherName: FIXTURES.teacherName,
          googleMeetUrl: FIXTURES.googleMeetUrl
        });
        break;
      case "demo-scheduled":
        htmlContent = getDemoScheduledTemplate({
          studentName: FIXTURES.studentName,
          demoDate: FIXTURES.demoDate,
          demoTime: FIXTURES.demoTime,
          teacherName: FIXTURES.teacherName,
          googleMeetUrl: FIXTURES.googleMeetUrl
        }, false);
        break;
      case "demo-rescheduled":
        htmlContent = getDemoScheduledTemplate({
          studentName: FIXTURES.studentName,
          demoDate: "31 July 2026",
          demoTime: "6:30 PM - 7:30 PM",
          teacherName: FIXTURES.teacherName,
          googleMeetUrl: FIXTURES.googleMeetUrl
        }, true);
        break;
      case "demo-rejected":
        htmlContent = getDemoRejectedTemplate({
          studentName: FIXTURES.studentName
        });
        break;
      case "post-demo-conversion":
        htmlContent = getPostDemoConversionTemplate({
          studentName: FIXTURES.studentName,
          previewUrl: FIXTURES.previewUrl,
          joinUrl: FIXTURES.joinUrl
        });
        break;
      case "student-welcome":
        htmlContent = getStudentInvitationTemplate({
          studentName: FIXTURES.studentName,
          studentId: FIXTURES.studentId,
          email: FIXTURES.email,
          passwordSetupUrl: FIXTURES.passwordSetupUrl,
          teacherName: FIXTURES.teacherName,
          demoDate: FIXTURES.demoDate
        });
        break;
      case "teacher-activation":
        htmlContent = getTeacherActivationTemplate({
          teacherName: "Prof. Dravina Gupta",
          email: "dravina.gupta@psysphere.com",
          passwordSetupUrl: FIXTURES.passwordSetupUrl
        });
        break;
      default:
        notFound();
    }
  } catch (err: any) {
    errorMsg = err?.message || String(err);
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Side Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-gray-200 bg-purple-50/50">
          <h1 className="text-lg font-serif font-bold text-purple-900">PsySphere</h1>
          <p className="text-xs text-purple-700 font-semibold mt-1 uppercase tracking-wider">Email Template Previewer</p>
          <div className="mt-2 text-[10px] bg-amber-100 border border-amber-200 text-amber-800 rounded px-2 py-1 font-medium">
            Development Only — Disabled in Prod
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50/30">
          {TEMPLATES.map((t) => {
            const isActive = template === t.id;
            return (
              <Link
                key={t.id}
                href={`/dev/email-preview/${t.id}`}
                className={`flex flex-col p-3 rounded-lg text-sm font-medium transition-all border ${
                  isActive 
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm" 
                    : "text-gray-700 bg-white hover:bg-gray-100 border-gray-200"
                }`}
              >
                <span>{t.name}</span>
                <span className={`text-[10px] mt-1 ${isActive ? "text-purple-200" : "text-gray-400"}`}>
                  /dev/email-preview/{t.id}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Active Template: <span className="text-purple-600 font-serif font-bold">{TEMPLATES.find(t => t.id === template)?.name || template}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Renders inside the PsySphere base email layout wrapper.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Subject Line Preview:</span>
            <span className="text-xs font-semibold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 border border-gray-200">
              {template === "demo-received" && "We've Received Your PsySphere Demo Request 💜"}
              {template === "new-lead-admin" && `New PsySphere Demo Request — ${FIXTURES.studentName}`}
              {template === "demo-approved" && "Your PsySphere Demo Request Has Been Approved 💜"}
              {template === "demo-scheduled" && "Your PsySphere Demo Class is Scheduled 🎓"}
              {template === "demo-rescheduled" && "Your PsySphere Demo Class Has Been Rescheduled"}
              {template === "demo-rejected" && "An Update About Your PsySphere Demo Request"}
              {template === "post-demo-conversion" && "How Was Your PsySphere Demo? Continue Your Journey With Us 💜"}
              {template === "student-welcome" && "Welcome to PsySphere 💜 Your Student Account is Ready"}
              {template === "teacher-activation" && "Welcome to PsySphere Faculty 💜"}
            </span>
          </div>
        </div>

        {/* Iframe Email Render Sandbox */}
        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex justify-center">
          {errorMsg ? (
            <div className="max-w-2xl w-full bg-red-50 border border-red-200 rounded-xl p-6 h-fit mt-12">
              <h3 className="text-red-800 font-bold mb-2">Template Render Error</h3>
              <p className="text-sm text-red-700 whitespace-pre-wrap font-mono bg-white p-4 rounded border border-red-100">{errorMsg}</p>
            </div>
          ) : (
            <div className="w-full max-w-[640px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden h-fit mb-12">
              {/* Fake Client Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="ml-4 font-medium truncate">To: {FIXTURES.email} | Subject: Preview</span>
              </div>
              <div 
                className="w-full"
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
