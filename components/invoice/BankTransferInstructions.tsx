"use client";

import { useState } from "react";
import { Copy, Check, Building2, Hash } from "lucide-react";
import { formatNaira } from "@/lib/utils";

type ExtraAccount = {
  bankName: string | null;
  accountNumber: string;
  accountName: string | null;
};

type Props = {
  amount: number | bigint;
  paymentReference: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  extraAccounts?: ExtraAccount[];
};

export function BankTransferInstructions({
  amount,
  paymentReference,
  bankAccountNumber,
  bankName,
  bankAccountName,
  extraAccounts = [],
}: Props) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAcct, setCopiedAcct] = useState(false);

  const hasBankDetails = bankAccountNumber && bankName && bankAccountName;
  const hasReference = paymentReference;

  const copyRef = async () => {
    if (!paymentReference) return;
    await navigator.clipboard.writeText(paymentReference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const copyAcct = async () => {
    if (!bankAccountNumber) return;
    await navigator.clipboard.writeText(bankAccountNumber);
    setCopiedAcct(true);
    setTimeout(() => setCopiedAcct(false), 2000);
  };

  if (!hasReference && !hasBankDetails && extraAccounts.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Pay via bank transfer
      </h3>
      <p className="text-xs text-slate-600 mb-3">
        Customer should pay the exact amount and use the reference below so we can match the payment.
      </p>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between items-center gap-2">
          <dt className="text-slate-500">Amount</dt>
          <dd className="font-semibold text-slate-900">{formatNaira(amount)}</dd>
        </div>
        {hasBankDetails && (
          <>
            <div className="flex justify-between items-center gap-2">
              <dt className="text-slate-500">Account</dt>
              <dd className="font-mono text-slate-900 flex items-center gap-1">
                {bankAccountNumber}
                <button
                  type="button"
                  onClick={copyAcct}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500"
                  aria-label="Copy account"
                >
                  {copiedAcct ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </dd>
            </div>
            <div className="flex justify-between items-center gap-2">
              <dt className="text-slate-500">Bank</dt>
              <dd className="text-slate-900">{bankName}</dd>
            </div>
            <div className="flex justify-between items-center gap-2">
              <dt className="text-slate-500">Name</dt>
              <dd className="text-slate-900">{bankAccountName}</dd>
            </div>
          </>
        )}
        {hasReference && (
          <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-200">
            <dt className="text-slate-500 flex items-center gap-1">
              <Hash className="h-4 w-4" /> Reference
            </dt>
            <dd className="font-mono font-semibold text-slate-900 flex items-center gap-1">
              {paymentReference}
              <button
                type="button"
                onClick={copyRef}
                className="p-1 rounded hover:bg-slate-200 text-slate-500"
                aria-label="Copy reference"
              >
                {copiedRef ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </dd>
          </div>
        )}
      </dl>
      {extraAccounts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-2">Or pay to any of these accounts</p>
          <ul className="space-y-2">
            {extraAccounts.map((acc, i) => (
              <li key={i} className="text-xs text-slate-700">
                <span className="font-medium">{acc.bankName ?? "Bank"}</span>
                {" · "}
                <span className="font-mono">{acc.accountNumber}</span>
                {acc.accountName && ` · ${acc.accountName}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!hasBankDetails && extraAccounts.length === 0 && (
        <p className="mt-3 text-xs text-amber-700">
          Add your bank account details in Settings so customers know where to pay.
        </p>
      )}
    </div>
  );
}
