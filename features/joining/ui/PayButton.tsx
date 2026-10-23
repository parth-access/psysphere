"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { startPaymentAction, confirmPaymentAction } from "@/app/join/pay/[token]/actions";
import { accentButtonClass } from "./Field";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

export function PayButton({ token, label }: { token: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    if (!window.Razorpay) {
      setError("The payment window is still loading. Please try again in a moment.");
      return;
    }
    setBusy(true);
    const res = await startPaymentAction(token);
    if (!res.ok) {
      setError(res.message);
      setBusy(false);
      return;
    }
    const { order } = res;
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amountPaise,
      currency: "INR",
      name: "Saarthi Classes",
      description: order.description,
      prefill: order.prefill,
      theme: { color: "#1F5E3B" },
      modal: { ondismiss: () => setBusy(false) },
      handler: async (response: RazorpayResponse) => {
        const done = await confirmPaymentAction(token, response);
        if (done.ok) {
          router.replace("/join/success");
        } else {
          setError(done.message);
          setBusy(false);
        }
      },
    });
    rzp.on("payment.failed", () => {
      setError("The payment didn’t go through. No money was taken. Please try again.");
      setBusy(false);
    });
    rzp.open();
  }

  return (
    <div className="flex flex-col gap-3">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <button type="button" onClick={pay} disabled={busy} className={accentButtonClass}>
        <Lock className="h-4 w-4" aria-hidden="true" />
        {busy ? "Opening payment…" : label}
      </button>
      {error && (
        <p role="alert" className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}
      <p className="text-[13px] text-paper/65">UPI, cards, net banking and wallets, through Razorpay.</p>
    </div>
  );
}
