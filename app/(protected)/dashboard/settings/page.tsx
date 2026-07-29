import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { SectionHeader } from "@/features/dashboard/ui/SectionHeader";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await enforcePageRole([ROLES.ADMIN]);
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Settings" 
        description="Manage your institute preferences and system configurations." 
      />

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
