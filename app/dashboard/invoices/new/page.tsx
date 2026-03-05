"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { formatNaira, parseNairaToKobo } from "@/lib/utils";

type Customer = { id: string; name: string; email: string | null; phone: string | null };
type Product = { id: string; name: string; price: number };

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<{ productName: string; quantity: number; price: number }[]>([
    { productName: "", quantity: 1, price: 0 },
  ]);
  const [note, setNote] = useState("");
  const [applyVat, setApplyVat] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {});
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0 && !customerId) {
      setCustomerId(preselectedCustomerId);
    }
  }, [preselectedCustomerId, customers, customerId]);

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

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const vat = applyVat ? Math.round(subtotal * 0.075) : 0;
  const total = subtotal + vat;

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
      const res = await fetch("/api/invoices", {
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
          applyVat,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create invoice");
      }
      const inv = await res.json();
      router.push(`/dashboard/invoices/${inv.id}`);
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
        href="/dashboard/invoices"
        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Create invoice</h1>

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
          <Link
            href="/dashboard/customers/new"
            className="mt-2 inline-block text-sm text-emerald-600 hover:underline"
          >
            + Add new customer
          </Link>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Items</label>
            <button
              type="button"
              onClick={addLine}
              className="text-sm text-emerald-600 font-medium flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add line
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-end"
              >
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
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="p-2 text-slate-400 hover:text-red-600"
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {products.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Tip: Add products in Settings to quick-fill items.
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={applyVat}
            onChange={(e) => setApplyVat(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm text-slate-700">Apply VAT 7.5%</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Payment terms, bank details, etc."
            rows={2}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="rounded-xl bg-slate-100 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">{formatNaira(subtotal)}</span>
          </div>
          {applyVat && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-600">VAT 7.5%</span>
              <span className="font-medium">{formatNaira(vat)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold mt-2 pt-2 border-t border-slate-200">
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
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create invoice"}
        </button>
      </form>
    </div>
  );
}
