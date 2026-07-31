import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { SectionHeader } from "@/features/dashboard/ui/SectionHeader";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { getConnectedClient } from "@/server/integrations/google";
import { disconnectGoogleAction } from "./actions";
import { Calendar as CalendarIcon, CheckCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  await enforcePageRole([ROLES.ADMIN]);
  
  const resolvedParams = await searchParams;
  const googleConnect = resolvedParams.google_connect;
  const errorMessage = resolvedParams.error_message;

  const googleConnection = await getConnectedClient();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Settings" 
        description="Manage your institute preferences and system configurations." 
      />

      {/* Connection Status Alerts */}
      {googleConnect === "success" && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-sm font-medium animate-in fade-in-50 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Google Calendar & Meet integrated successfully! You can now schedule live lectures automatically.</span>
        </div>
      )}

      {googleConnect === "error" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl text-sm font-medium animate-in fade-in-50 duration-300">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Failed to connect Google Calendar</p>
            <p className="text-xs text-red-700">{errorMessage ? decodeURIComponent(errorMessage as string) : "An unknown error occurred during authentication."}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-1">
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-brand-primary bg-brand-surface rounded-lg">Institute Profile</button>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Working Hours</button>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Integrations</button>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Billing</button>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <DashboardCard>
            <SectionHeader title="Institute Profile" />
            <div className="space-y-6 max-w-2xl mt-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-900">Institute Name</label>
                <input 
                  type="text" 
                  defaultValue="PsySphere" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-900">Contact Email</label>
                <input 
                  type="email" 
                  defaultValue="contact@psysphere.com" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-900">Support Phone</label>
                <input 
                  type="tel" 
                  defaultValue="+91 9876543210" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button className="bg-brand-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-hover transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </DashboardCard>

          {/* Google Integration Section */}
          <DashboardCard>
            <SectionHeader title="Google Calendar & Meet Integration" />
            <div className="space-y-6 max-w-2xl mt-6">
              <div className="flex items-start gap-4 p-5 bg-[#FAF8F5] border border-gray-100 rounded-2xl">
                <div className="p-3.5 bg-brand-surface rounded-xl shrink-0">
                  <CalendarIcon className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-semibold text-gray-900">Automatic Live Lectures scheduling</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Automatically create calendar events in your centralized institutional Google account (<strong>psysphereclasses@gmail.com</strong>) and dynamically attach interactive Google Meet video-conferencing access for student/educator dashboard joins.
                  </p>
                  
                  <div className="pt-4">
                    {googleConnection ? (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl font-medium">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Connected as: <strong className="font-bold">{googleConnection.email}</strong></span>
                        </div>
                        <form action={disconnectGoogleAction} className="pt-1">
                          <button
                            type="submit"
                            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-colors block"
                          >
                            Disconnect Google Calendar
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 px-3.5 py-2 rounded-xl font-medium">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Not Connected</span>
                        </div>
                        <div>
                          <a
                            href="/api/integrations/google/connect"
                            className="inline-flex items-center justify-center bg-brand-primary text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer"
                          >
                            Connect Google Calendar
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard>
            <SectionHeader title="System Defaults" />
            <div className="space-y-6 max-w-2xl mt-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-900">Timezone</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white">
                  <option>Asia/Kolkata (IST)</option>
                  <option>UTC</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-900">Default Batch Size</label>
                <input 
                  type="number" 
                  defaultValue="50" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button className="bg-brand-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-hover transition-colors">
                  Save Defaults
                </button>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
