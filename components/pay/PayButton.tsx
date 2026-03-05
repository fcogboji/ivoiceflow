"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";
import { formatNaira } from "@/lib/utils";

type Props = {
  invoiceId: string;
  amount: number | bigint;
  customerEmail?: string;
};

export function PayButton({ invoiceId, amount, customerEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customerEmail || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment could not be started");
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      throw new Error("No payment link received");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 text-white py-4 px-4 font-semibold flex items-center justify-center gap-2 min-h-[52px] hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CreditCard className="h-5 w-5" />
        )}
        Pay {formatNaira(amount)} securely
      </button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
}
