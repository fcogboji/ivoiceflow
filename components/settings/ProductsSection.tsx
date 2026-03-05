"use client";

import { useState, useEffect } from "react";
import { formatNaira } from "@/lib/utils";
import { Plus, Loader2, Trash2 } from "lucide-react";

type Product = { id: string; name: string; description: string | null; price: number | bigint };

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const priceKobo = Math.round(parseFloat(price.replace(/,/g, "")) * 100) || 0;
    setAdding(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), price: priceKobo }),
      });
      if (!res.ok) throw new Error("Failed to add");
      setName("");
      setPrice("");
      load();
    } catch {
      setError("Could not add product.");
    } finally {
      setAdding(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      load();
    } catch {}
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Products / services</h2>
      <p className="text-sm text-slate-600 mb-4">
        Add items here to quick-fill when creating invoices.
      </p>

      <form onSubmit={addProduct} className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm flex-1 min-w-[120px]"
        />
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (₦)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-28"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-slate-500">No products yet. Add one above.</p>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-500">{formatNaira(p.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteProduct(p.id)}
                className="p-2 text-slate-400 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
