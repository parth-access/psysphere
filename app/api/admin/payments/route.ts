import { NextResponse } from "next/server";
import { getProfile } from "@/server/authorization/getProfile";
import { listPayments } from "@/src/domains/joining/payments";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // Quote, and neutralise spreadsheet formulas
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET() {
  const me = await getProfile();
  if (!me || me.role !== "admin" || !me.isActive) return new NextResponse("Forbidden", { status: 403 });

  const rows = await listPayments();
  const header = ["Paid at (IST)", "Student", "Email", "Phone", "Parent", "Parent phone", "Batch", "Plan", "Amount (INR)", "Razorpay payment ID", "Razorpay order ID", "Status"];
  const lines = rows.map(({ r, batchName }) =>
    [
      r.paidAt?.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      r.studentName, r.email, r.phone, r.parentName, r.parentPhone, batchName, r.planName, r.amountInr,
      r.razorpayPaymentId, r.razorpayOrderId, r.status,
    ].map(cell).join(",")
  );
  const csv = [header.map(cell).join(","), ...lines].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="saarthi-classes-payments-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
