import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { Check, CircleDot, Circle, Calendar, Clock, Monitor, User, Video, Mail, Key } from "lucide-react";
import { admissionRepository } from "@/src/domains/admissions/repository";
import { teacherRepository } from "@/src/domains/users/repository";
import { approveAdmissionAction, rejectAdmissionAction, convertAdmissionAction, scheduleDemoFormAction } from "../actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdmissionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const admissionId = resolvedParams.id;
  
  const admission = await admissionRepository.findById(admissionId);
  const teachers = await teacherRepository.findAllTeachers();

  if (!admission) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-xl font-bold mb-2">Admission Not Found</h2>
        <p className="text-sm text-gray-400 mb-4">The admission record with ID {admissionId} does not exist in the database.</p>
        <Link href="/dashboard/admissions" className="text-brand-primary hover:underline font-medium text-sm">Back to Admissions</Link>
      </div>
    );
  }

  // Dynamic timeline stage calculation
  const STAGES = [
    { 
      id: 1, 
      title: "Lead Created", 
      status: "completed", 
      date: new Date(admission.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
    },
    { 
      id: 2, 
      title: "Demo Booked", 
      status: ["LEAD"].includes(admission.status) ? "current" : "completed", 
      date: ["LEAD"].includes(admission.status) ? "TBD" : "Completed" 
    },
    { 
      id: 3, 
      title: "Approved", 
      status: ["LEAD", "DEMO_BOOKED"].includes(admission.status) ? "upcoming" : 
              admission.status === "DEMO_APPROVED" ? "current" : "completed", 
      date: ["LEAD", "DEMO_BOOKED"].includes(admission.status) ? "TBD" : "Completed" 
    },
    { 
      id: 4, 
      title: "Teacher Assigned", 
      status: ["LEAD", "DEMO_BOOKED", "DEMO_APPROVED"].includes(admission.status) ? "upcoming" : 
              admission.status === "DEMO_SCHEDULED" && !admission.assignedTeacher ? "current" : "completed", 
      date: admission.assignedTeacher ? "Assigned" : "TBD" 
    },
    { 
      id: 5, 
      title: "Demo Scheduled", 
      status: ["LEAD", "DEMO_BOOKED", "DEMO_APPROVED"].includes(admission.status) ? "upcoming" : 
              admission.status === "DEMO_SCHEDULED" ? "current" : "completed", 
      date: admission.demoDate ? new Date(admission.demoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "TBD" 
    },
    { 
      id: 6, 
      title: "Demo Completed", 
      status: ["LEAD", "DEMO_BOOKED", "DEMO_APPROVED", "DEMO_SCHEDULED"].includes(admission.status) ? "upcoming" : 
              admission.status === "DEMO_COMPLETED" ? "current" : "completed", 
      date: "TBD" 
    },
    { 
      id: 7, 
      title: "Enrolled", 
      status: admission.status === "ENROLLED" ? "completed" : "upcoming", 
      date: admission.status === "ENROLLED" ? "Enrolled" : "TBD" 
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Admission Details</h1>
            <StatusBadge status={admission.status as any} />
          </div>
          <p className="text-sm text-gray-500">Manage admission workflow for {admission.studentName}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <form action={rejectAdmissionAction.bind(null, admissionId)}>
            <button type="submit" className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">
              Reject
            </button>
          </form>
          <form action={approveAdmissionAction.bind(null, admissionId)}>
            <button type="submit" className="px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-xl text-sm font-medium hover:bg-blue-100 cursor-pointer">
              Approve Demo
            </button>
          </form>
          <form action={convertAdmissionAction.bind(null, admissionId)}>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 cursor-pointer">
              Convert to Student
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Student Information">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{admission.studentName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{admission.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900">{admission.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Class</p>
                <p className="font-medium text-gray-900">{admission.class}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Parent Name</p>
                <p className="font-medium text-gray-900">{admission.parentName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Preferred Slot</p>
                <p className="font-medium text-gray-900">{admission.preferredDate} {admission.preferredTime}</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Teacher Assignment & Scheduler">
            <form action={scheduleDemoFormAction} className="space-y-6">
              <input type="hidden" name="id" value={admissionId} />
              
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Assign Teacher</label>
                <select name="teacherId" className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary">
                  <option value="">Select a teacher...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id} selected={admission.assignedTeacher === t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand-primary" />
                  Demo Class Schedule
                </h4>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input type="date" name="demoDate" defaultValue={admission.demoDate || ""} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Time</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input type="time" defaultValue="18:00" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Duration</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                      <option>60 Minutes</option>
                      <option>45 Minutes</option>
                      <option>90 Minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Platform</label>
                    <div className="relative">
                      <Monitor className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input type="text" defaultValue="Google Meet" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Meeting Link</label>
                  <input type="url" defaultValue="https://meet.google.com/abc-defg-hij" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer">
                    Update Schedule
                  </button>
                </div>
              </div>
            </form>
          </DashboardCard>

          <DashboardCard title="Credentials Preview">
            <div className="p-6 bg-[#FDFBF7] border border-gray-200 rounded-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Subject</p>
                  <p className="text-sm font-medium text-gray-900">Welcome to PsySphere! Your Demo Account is Ready.</p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-xl font-serif font-bold text-gray-900 tracking-tight">PsySphere</h1>
                </div>
                
                <p className="text-sm text-gray-600">Dear {admission.studentName},</p>
                <p className="text-sm text-gray-600">
                  Your demo class for {admission.class} has been scheduled. To access your student dashboard and join the class, please use the following temporary credentials:
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Student ID</p>
                      <p className="font-mono text-sm font-medium text-gray-900">PSY-{new Date().getFullYear()}-XXXX</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Username</p>
                      <p className="font-mono text-sm font-medium text-gray-900">{admission.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm">
                  <Key className="w-5 h-5 shrink-0" />
                  <p>You will be required to set a permanent password upon your first login for security purposes.</p>
                </div>
                
                <div className="pt-4 text-center">
                  <button className="px-6 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-medium">
                    Access Student Dashboard
                  </button>
                </div>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Internal Notes">
            <textarea 
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary min-h-[100px]"
              placeholder="Add internal comments about this admission..."
              defaultValue={admission.notes || "Student is highly interested. Highlight key teaching strategies during demo."}
            />
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Save Note
              </button>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Admission Timeline">
            <div className="relative mt-2">
              <div className="absolute top-2 bottom-2 left-[11px] w-px bg-gray-100"></div>
              <div className="space-y-6">
                {STAGES.map((stage) => {
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
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
