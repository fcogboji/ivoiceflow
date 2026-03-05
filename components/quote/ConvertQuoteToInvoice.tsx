"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText } from "lucide-react";

type Props = { quoteId: string; status: string };

export function ConvertQuoteToInvoice({ quoteId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyVat: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to convert");
      }
      const { invoice } = await res.json();
      router.push(`/dashboard/invoices/${invoice.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const canConvert = status === "approved" || status === "sent" || status === "draft";

  if (!canConvert) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-700 mb-3">Quote approved? Create an invoice and send for payment.</p>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <button
        type="button"
        onClick={handleConvert}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-3 font-medium hover:bg-emerald-700 min-h-[48px] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
        Convert to invoice
      </button>
    </div>
  );
}
