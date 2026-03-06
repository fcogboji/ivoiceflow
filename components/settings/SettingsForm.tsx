"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { getDefaultWhatsAppTemplate } from "@/lib/utils";

const LOGO_MAX_SIZE = 400;
const LOGO_QUALITY = 0.85;

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      let width = w;
      let height = h;
      if (w > LOGO_MAX_SIZE || h > LOGO_MAX_SIZE) {
        if (w >= h) {
          width = LOGO_MAX_SIZE;
          height = Math.round((h * LOGO_MAX_SIZE) / w);
        } else {
          height = LOGO_MAX_SIZE;
          width = Math.round((w * LOGO_MAX_SIZE) / h);
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(url);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", LOGO_QUALITY);
        resolve(dataUrl);
      } catch {
        reject(new Error("Could not resize image"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };
    img.src = url;
  });
}

type User = {
  id: string;
  businessName: string;
  phone: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  cacNumber: string | null;
  tinNumber: string | null;
  paymentProvider: string;
  whatsappTemplate: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
};

export function SettingsForm({ user }: { user: User }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(user.logoUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const [businessName, setBusinessName] = useState(user.businessName);
  const [brandColor, setBrandColor] = useState(user.brandColor ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [cacNumber, setCacNumber] = useState(user.cacNumber ?? "");
  const [tinNumber, setTinNumber] = useState(user.tinNumber ?? "");
  const [paystackSecret, setPaystackSecret] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState(user.bankAccountNumber ?? "");
  const [bankName, setBankName] = useState(user.bankName ?? "");
  const [bankAccountName, setBankAccountName] = useState(user.bankAccountName ?? "");
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    user.whatsappTemplate ?? getDefaultWhatsAppTemplate()
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    setLogoUrl(user.logoUrl);
  }, [user.logoUrl]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";
    setLogoUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: dataUrl }),
      });
      if (!res.ok) throw new Error("Upload failed");
      setLogoUrl(dataUrl);
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Could not upload logo." });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoUploading(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: null }),
      });
      if (!res.ok) throw new Error("Failed");
      setLogoUrl(null);
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Could not remove logo." });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          brandColor: brandColor.trim() && /^#[0-9A-Fa-f]{6}$/.test(brandColor.trim()) ? brandColor.trim() : null,
          phone: phone.trim() || undefined,
          cacNumber: cacNumber.trim() || undefined,
          tinNumber: tinNumber.trim() || undefined,
          whatsappTemplate: whatsappTemplate.trim() || undefined,
          paystackSecret: paystackSecret.trim() || undefined,
          bankAccountNumber: bankAccountNumber.trim() || undefined,
          bankName: bankName.trim() || undefined,
          bankAccountName: bankAccountName.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "ok", text: "Saved." });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mb-10">
      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Company logo</h3>
        <p className="text-xs text-slate-600 mb-3">
          Shown on invoices and quotes. PNG or JPG, max 400px (resized automatically).
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {logoUrl ? (
            <div className="relative">
              <img
                src={logoUrl}
                alt="Company logo"
                className="h-16 w-auto max-w-[180px] object-contain rounded-lg border border-slate-200 bg-white p-1"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={logoUploading}
                className="absolute -top-2 -right-2 rounded-full bg-slate-700 text-white p-1 hover:bg-slate-800 disabled:opacity-50"
                aria-label="Remove logo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
            >
              {logoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {logoUrl ? "Change logo" : "Upload logo"}
            </button>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Business name</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Brand color</label>
        <p className="text-xs text-slate-600 mb-2">
          Main color for invoices and quotes (header, company name, table headings, total). Use your logo or website color.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            value={/^#[0-9A-Fa-f]{6}$/.test(brandColor.trim()) ? brandColor.trim() : "#1e3a5f"}
            onChange={(e) => setBrandColor(e.target.value)}
            className="h-10 w-14 rounded-lg border border-slate-300 cursor-pointer bg-white p-0.5"
            title="Pick color"
          />
          <input
            type="text"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            placeholder="#2563EB"
            className="w-28 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">Hex code, e.g. #2563EB (blue), #22C55E (green), #FF4D4F (red).</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp / Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08012345678"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">CAC number (optional)</label>
          <input
            type="text"
            value={cacNumber}
            onChange={(e) => setCacNumber(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">TIN (optional)</label>
          <input
            type="text"
            value={tinNumber}
            onChange={(e) => setTinNumber(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Paystack secret key (optional)
        </label>
        <input
          type="password"
          value={paystackSecret}
          onChange={(e) => setPaystackSecret(e.target.value)}
          placeholder="sk_live_... or leave blank to use app default"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <p className="mt-1 text-xs text-slate-500">
          Use your own key for payments. Otherwise set PAYSTACK_SECRET_KEY in environment.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Bank transfer details</h3>
        <p className="text-xs text-slate-600 mb-3">
          Shown on invoices so customers can pay by transfer. Use the reference on each invoice to match payments.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account number</label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="0123456789"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bank name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. GTBank, Access Bank, Opay"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account name</label>
            <input
              type="text"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="Business or your name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          WhatsApp message template
        </label>
        <textarea
          value={whatsappTemplate}
          onChange={(e) => setWhatsappTemplate(e.target.value)}
          rows={6}
          placeholder="Use {{customerName}}, {{amount}}, {{invoiceLink}}"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
        />
      </div>
      {message && (
        <p className={message.type === "ok" ? "text-emerald-600" : "text-red-600"}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-emerald-600 text-white px-6 py-3 font-medium min-h-[48px] disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        Save settings
      </button>
    </form>
  );
}
