import { getRequestByPayToken } from "@/src/domains/joining/service";
import { PublicShell } from "@/features/joining/ui/PublicShell";
import { PayProblemView, PayView } from "@/features/joining/ui/JoinStatusViews";

export const dynamic = "force-dynamic";
export const metadata = { title: "Complete payment | Saarthi Classes", robots: { index: false } };

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await getRequestByPayToken(token);
  const r = found?.request;

  return (
    <PublicShell>
      {!found || !r ? (
        <PayProblemView kind="invalid" />
      ) : r.status === "paid" || r.status === "enrolled" ? (
        <PayProblemView kind="paid" />
      ) : r.status !== "approved" || found.expired ? (
        <PayProblemView kind="expired" />
      ) : (
        <PayView
          token={token}
          d={{
            firstName: r.studentName.split(" ")[0],
            studentName: r.studentName,
            email: r.email,
            batchName: found.batchName,
            schedule: found.schedule,
            planName: r.planName,
            amountInr: r.amountInr,
            // Admin approval sets approvedBy; open batches skip approval and leave it empty.
            approved: r.approvedBy !== null,
          }}
        />
      )}
    </PublicShell>
  );
}
