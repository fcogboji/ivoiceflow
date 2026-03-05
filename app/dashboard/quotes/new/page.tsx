"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { formatNaira, parseNairaToKobo } from "@/lib/utils";

type Customer = { id: string; name: string };

export default function NewQuotePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<{ productName: string; quantity: number; price: number }[]>([
    { productName: "", quantity: 1, price: 0 },
  ]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {});
  }, []);

  const addLine = () => {
    setItems((prev) => [...prev, { productName: "", quantity: 1, price: 0 }]);
  };

  const removeLine = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (
    index: number,
    field: "productName" | "quantity" | "price",
    value: string | number
  ) => {
    setItems((prev) => {
      const next = [...prev];
      if (field === "price" && typeof value === "string") {
        next[index] = { ...next[index], price: parseNairaToKobo(value) };
      } else if (field === "quantity") {
        next[index] = { ...next[index], quantity: Math.max(1, Number(value) || 1) };
      } else if (field === "productName") {
        next[index] = { ...next[index], productName: String(value) };
      }
      return next;
    });
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!customerId) {
      setError("Select a customer.");
      return;
    }
    const validItems = items.filter((i) => i.productName.trim() && i.price > 0);
    if (validItems.length === 0) {
      setError("Add at least one item with name and amount.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          items: validItems.map((i) => ({
            productName: i.productName.trim(),
            quantity: i.quantity,
            price: i.price,
          })),
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create quote");
      }
      const quote = await res.json();
      router.push(`/dashboard/quotes/${quote.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <Link
        href="/dashboard/quotes"
        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Create quote</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Customer *</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            required
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Items</label>
            <button type="button" onClick={addLine} className="text-sm text-emerald-600 font-medium flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add line
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.productName}
                    onChange={(e) => updateLine(index, "productName", e.target.value)}
                    placeholder="Item or service"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLine(index, "quantity", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="0"
                    value={item.price ? (item.price / 100).toLocaleString("en-NG") : ""}
                    onChange={(e) => updateLine(index, "price", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-1 text-sm text-slate-500">₦</div>
                <div className="col-span-1">
                  {items.length > 1 ? (
                    <button type="button" onClick={() => removeLine(index)} className="p-2 text-slate-400 hover:text-red-600" aria-label="Remove line">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Valid until, terms, etc."
            rows={2}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="rounded-xl bg-slate-100 p-4">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-emerald-600 text-white py-3.5 font-medium min-h-[48px] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create quote"}
        </button>
      </form>
    </div>
  );
}
