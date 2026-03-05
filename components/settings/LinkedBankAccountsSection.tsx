"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Building2 } from "lucide-react";

type LinkedAccount = {
  id: string;
  bankName: string | null;
  accountNumber: string;
  accountName: string | null;
};

export function LinkedBankAccountsSection() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/linked-accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const bn = bankName.trim();
    const num = accountNumber.trim().replace(/\s/g, "");
    const an = accountName.trim();
    if (!bn || !num || !an) return;
    setAdding(true);
    try {
      const res = await fetch("/api/linked-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName: bn, accountNumber: num, accountName: an }),
      });
      if (!res.ok) throw new Error("Failed");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      await fetchAccounts();
      router.refresh();
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/linked-accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      await fetchAccounts();
      router.refresh();
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 mb-10">
      <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Multi-account tracking
      </h3>
      <p className="text-xs text-slate-600 mb-4">
        Add extra bank accounts (GTBank, Access Bank, Opay, Moniepoint, etc.). All can receive payments; transactions appear in one dashboard.
      </p>

      {loading ? (
        <p className="text-sm text-slate-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {accounts.map((acc) => (
              <li
                key={acc.id}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800">{acc.bankName ?? "Bank"}</span>
                <span className="font-mono text-slate-600">{acc.accountNumber}</span>
                <span className="text-slate-500 truncate min-w-0 flex-1">{acc.accountName ?? ""}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(acc.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  aria-label="Remove account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end">
            <input
              type="text"
              placeholder="Bank (e.g. GTBank)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-28 min-w-0"
            />
            <input
              type="text"
              placeholder="Account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-32 font-mono min-w-0"
            />
            <input
              type="text"
              placeholder="Account name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm flex-1 min-w-[100px]"
            />
            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-slate-700 text-white px-3 py-2 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </form>
        </>
      )}
    </div>
  );
}
