import { PublicShell } from "@/features/joining/ui/PublicShell";
import { RequestedView } from "@/features/joining/ui/JoinStatusViews";

export const metadata = { title: "Request sent | Saarthi Classes", robots: { index: false } };

export default function RequestedPage() {
  return (
    <PublicShell>
      <RequestedView />
    </PublicShell>
  );
}
