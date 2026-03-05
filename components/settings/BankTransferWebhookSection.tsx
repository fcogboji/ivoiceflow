"use client";

import { useState } from "react";
import { Copy, Check, Webhook } from "lucide-react";

type Props = {
  webhookUrl: string;
};

export function BankTransferWebhookSection({ webhookUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = webhookUrl.replace(/\/$/, "") + "/api/webhooks/bank-transfer";

  async function copyUrl() {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 mb-10">
      <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
        <Webhook className="h-4 w-4" />
        Auto-match bank transfers (Mono / Okra)
      </h3>
      <p className="text-xs text-slate-600 mb-3">
        When you connect a provider that monitors your bank transactions (e.g. Mono, Okra), point their webhook to the URL below. When a transfer is detected, they POST to this endpoint and we match it to an invoice and mark it paid.
      </p>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <code className="text-xs bg-white border border-slate-200 rounded px-2 py-1.5 font-mono break-all flex-1 min-w-0">
          {fullUrl}
        </code>
        <button
          type="button"
          onClick={copyUrl}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-2">Expected POST body (JSON):</p>
      <pre className="text-xs bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto">
{`{
  "reference": "INV-A1B2C3",
  "amountKobo": 8500000,
  "provider": "mono"
}`}
      </pre>
      <p className="text-xs text-slate-500 mt-2">
        <strong>reference</strong> must match the invoice payment reference. <strong>amountKobo</strong> is amount in kobo. Optional: set <code className="bg-white px-1 rounded">BANK_TRANSFER_WEBHOOK_SECRET</code> in env and send it in header <code className="bg-white px-1 rounded">x-bank-transfer-secret</code>.
      </p>
    </div>
  );
}
