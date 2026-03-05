"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, Check, Loader2, Receipt } from "lucide-react";

type Props = {
  invoiceId: string;
  status: string;
  payLink: string;
  verifyLink?: string;
};

export function InvoiceActions({ invoiceId, status, payLink, verifyLink }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [verifyCopied, setVerifyCopied] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(payLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyVerifyLink = async () => {
    if (!verifyLink) return;
    await navigator.clipboard.writeText(verifyLink);
    setVerifyCopied(true);
    setTimeout(() => setVerifyCopied(false), 2000);
  };

  const markPaid = async () => {
    setMarkingPaid(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (res.ok) {
        router.refresh();
        // Automatically open receipt for print/save
        window.open(`/api/invoices/${invoiceId}/receipt`, "_blank");
      }
    } finally {
      setMarkingPaid(false);
    }
  };

  const downloadPdf = () => {
    window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
  };

  const downloadReceipt = () => {
    window.open(`/api/invoices/${invoiceId}/receipt`, "_blank");
  };

  return (
    <>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-700 px-4 py-3 font-medium hover:bg-slate-50 min-h-[48px]"
      >
        {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
        {copied ? "Copied!" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={downloadPdf}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-700 px-4 py-3 font-medium hover:bg-slate-50 min-h-[48px]"
      >
        <Download className="h-5 w-5" /> Print / Save PDF
      </button>
      {status === "paid" && (
        <button
          type="button"
          onClick={downloadReceipt}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 font-medium hover:bg-emerald-100 min-h-[48px]"
        >
          <Receipt className="h-5 w-5" /> Download receipt
        </button>
      )}
      {verifyLink && (
        <button
          type="button"
          onClick={copyVerifyLink}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-700 px-4 py-3 font-medium hover:bg-slate-50 min-h-[48px]"
          title="Share with customer to verify if payment was received"
        >
          {verifyCopied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
          {verifyCopied ? "Copied!" : "Copy verify link"}
        </button>
      )}
      {status === "pending" && (
        <button
          type="button"
          onClick={markPaid}
          disabled={markingPaid}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 font-medium hover:bg-slate-800 min-h-[48px] disabled:opacity-50"
        >
          {markingPaid ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Mark as paid
        </button>
      )}
    </>
  );
}
