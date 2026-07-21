import { MOCK_STUDENT_USER } from "@/features/student/mock/data";
import { UserCircle, Mail, Phone, MapPin, Building, GraduationCap, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Student Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Header Cover */}
        <div className="h-32 bg-brand-surface relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                <UserCircle className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pt-14 pb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{MOCK_STUDENT_USER.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{MOCK_STUDENT_USER.demoId}</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-medium uppercase tracking-wider">
                  Demo Student
                </span>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Edit Profile
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{MOCK_STUDENT_USER.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{MOCK_STUDENT_USER.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Academic Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{MOCK_STUDENT_USER.institute}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{MOCK_STUDENT_USER.preferredBatch}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-brand-primary" />
                    <span className="text-gray-900 capitalize">Admission: {MOCK_STUDENT_USER.admissionStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
