import { PublicShell } from "@/features/joining/ui/PublicShell";
import { SuccessView } from "@/features/joining/ui/JoinStatusViews";

export const metadata = { title: "Welcome | Saarthi Classes", robots: { index: false } };

export default function JoinSuccessPage() {
  return (
    <PublicShell>
      <SuccessView />
    </PublicShell>
  );
}
