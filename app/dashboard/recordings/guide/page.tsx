import Link from "next/link";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";

const SETUP = [
  <>Download OBS Studio, which is free, from <a href="https://obsproject.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">obsproject.com</a>. It needs a laptop or desktop.</>,
  <>In OBS, go to <strong>Settings → Video</strong> and set Output Resolution to <strong>1280x720</strong> and frame rate to <strong>30</strong>.</>,
  <>In <strong>Settings → Output</strong>, set Recording Quality to <strong>High Quality, Medium File Size</strong> and Recording Format to <strong>MP4</strong>. If your version offers <strong>Hybrid MP4</strong>, choose that, because the file survives a crash.</>,
  <>Under <strong>Sources</strong>, add <strong>Screen Capture</strong> or <strong>Display Capture</strong>, and allow it if your computer asks.</>,
  <>Check the <strong>Audio Mixer</strong>: the bars for your microphone and for desktop audio should both move, so students’ questions are recorded too.</>,
  <>Record five minutes as a test and check the sound and file size. A file over 2 GB can’t be uploaded, so if a full class would be bigger, lower the Recording Quality setting.</>,
];

const EACH_CLASS = [
  <>Tell students at the start that the class is being recorded and that the batch can watch it for 24 hours. OBS doesn’t notify anyone in the Meet.</>,
  <>Press <strong>Start Recording</strong> in OBS, and <strong>Stop Recording</strong> when the class ends.</>,
  <>After class, go to <Link href="/dashboard/classes" className="font-semibold underline underline-offset-2">Classes</Link>, find it under Past Lectures, and choose <strong>Upload recording</strong>.</>,
  <>Keep the page open until the upload finishes. If the connection drops, choose the same file again and it carries on.</>,
  <>Google Drive then processes the video, which can take 20 minutes or longer. Students get an email when it’s ready, and it’s deleted 24 hours later.</>,
];

function Steps({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink-700">
      {steps.map((step, i) => <li key={i}>{step}</li>)}
    </ol>
  );
}

export default async function RecordingGuidePage() {
  await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER]);
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="How to record a class" description="Set up once, then follow the same steps for each class." />
      <DashboardCard title="Set up OBS once"><Steps steps={SETUP} /></DashboardCard>
      <DashboardCard title="For each class"><Steps steps={EACH_CLASS} /></DashboardCard>
    </div>
  );
}
