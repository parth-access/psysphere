import { SubmitButton } from "@/features/shared/ui/SubmitButton";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { SectionHeader } from "@/features/dashboard/ui/SectionHeader";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { calendarAccount, getConnectedClient, hasMeetScope } from "@/server/integrations/google";
import { disconnectGoogleAction } from "./actions";
import { getSettings } from "@/src/domains/settings/service";
import { EMAIL_DEFAULTS } from "@/src/domains/email/constants";
import { ContactSettingsForm, ClassDefaultsForm, NotificationsForm } from "@/features/dashboard/ui/SettingsForms";
import { formatIST } from "@/lib/ids";
import { Calendar as CalendarIcon, CheckCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { id: "contact", label: "Contact details" },
  { id: "classes", label: "Class defaults" },
  { id: "notifications", label: "Notifications" },
  { id: "google", label: "Google" },
];

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  await enforcePageRole([ROLES.ADMIN]);
  
  const resolvedParams = await searchParams;
  const googleConnect = resolvedParams.google_connect;
  const errorMessage = resolvedParams.error_message;

  const [googleConnection, settings] = await Promise.all([getConnectedClient(), getSettings()]);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Settings" 
        description="Contact details, class defaults, notifications and Google." 
      />

      {/* Connection Status Alerts */}
      {googleConnect === "success" && (
        <div className="flex items-center gap-3 bg-sage-100 border border-sage-100 text-sage-600 p-4 rounded-xl text-sm font-medium animate-in fade-in-50 duration-300">
          <CheckCircle className="w-5 h-5 text-sage-600 shrink-0" />
          <span>Google Calendar & Meet integrated successfully! You can now schedule live lectures automatically.</span>
        </div>
      )}

      {googleConnect === "error" && (
        <div className="flex items-start gap-3 bg-rose-100 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm font-medium animate-in fade-in-50 duration-300">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Failed to connect Google Calendar</p>
            <p className="text-xs text-rose-600">{errorMessage ? decodeURIComponent(errorMessage as string) : "An unknown error occurred during authentication."}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <nav aria-label="Settings sections" className="lg:col-span-1">
          <ul className="flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:flex-col">
            {SECTIONS.map((sct) => (
              <li key={sct.id}>
                <a href={`#${sct.id}`} className="block whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-deep hover:text-ink-900">
                  {sct.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6 lg:col-span-3">
          <section id="contact" className="scroll-mt-6">
            <DashboardCard title="Contact details">
              <ContactSettingsForm settings={settings} />
            </DashboardCard>
          </section>

          <section id="classes" className="scroll-mt-6">
            <DashboardCard title="Class defaults">
              <ClassDefaultsForm settings={settings} />
            </DashboardCard>
          </section>

          <section id="notifications" className="scroll-mt-6">
            <DashboardCard title="Notifications">
              <NotificationsForm settings={settings} envAlertEmail={EMAIL_DEFAULTS.ADMIN ?? null} />
            </DashboardCard>
          </section>

          <section id="google" className="scroll-mt-6">
          <DashboardCard className="scroll-mt-6" >
            <SectionHeader title="Google Calendar & Meet Integration" />
            <div className="space-y-6 max-w-2xl mt-6">
              <div className="flex items-start gap-4 p-5 bg-paper border border-line rounded-2xl">
                <div className="p-3.5 bg-brand-surface rounded-xl shrink-0">
                  <CalendarIcon className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-semibold text-ink-900">Automatic Live Lectures scheduling</h4>
                  <p className="text-xs text-ink-700 leading-relaxed">
                    Automatically create calendar events in your centralized institutional Google account (<strong>{calendarAccount()}</strong>) and dynamically attach interactive Google Meet video-conferencing access for student/educator dashboard joins.
                  </p>
                  
                  <div className="pt-4">
                    {googleConnection ? (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-xs text-sage-600 bg-sage-100 border border-sage-100 px-3.5 py-2 rounded-xl font-medium">
                          <CheckCircle className="w-4 h-4 text-sage-600" />
                          <span>Connected as: <strong className="font-bold">{googleConnection.email}</strong></span>
                        </div>
                        {!hasMeetScope(googleConnection.scopes) && (
                          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-marigold-100 bg-marigold-100 px-3.5 py-2.5 text-xs font-medium text-gold-700">
                            <span>Reconnect once to turn on automatic attendance from Google Meet.</span>
                            <a href="/api/integrations/google/connect" className="font-semibold underline underline-offset-2">Reconnect Google</a>
                          </div>
                        )}
                        <form action={disconnectGoogleAction} className="pt-1">
                          <SubmitButton
                            type="submit"
                            className="text-xs font-semibold text-rose-600 hover:text-rose-600 hover:underline cursor-pointer transition-colors block"
                          >
                            Disconnect Google Calendar
                          </SubmitButton>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-xs text-gold-700 bg-marigold-100 border border-marigold-100 px-3.5 py-2 rounded-xl font-medium">
                          <AlertTriangle className="w-4 h-4 text-gold-700" />
                          <span>Not Connected</span>
                        </div>
                        <div>
                          <a
                            href="/api/integrations/google/connect"
                            className="inline-flex items-center justify-center bg-brand-primary text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer"
                          >
                            Connect Google Calendar
                          </a>
                          <p className="mt-2 text-xs text-ink-500">Choose <strong>{calendarAccount()}</strong> when Google asks. Other accounts are refused.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
          </section>

          {settings.updatedAt && (
            <p className="text-[13px] text-ink-500">Last saved {formatIST(new Date(settings.updatedAt))}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
