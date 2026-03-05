"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUser) {
      router.push("/sign-in");
      return;
    }
  }, [isLoaded, clerkUser, router]);

  const handleFinish = async () => {
    setError("");
    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 pb-24">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold text-slate-900">Set up your business</h1>
        <p className="text-slate-600 mt-1 text-sm">Takes less than a minute.</p>

        <div className="mt-8">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step >= 1 ? "bg-emerald-600" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step >= 2 ? "bg-emerald-600" : "bg-slate-200"
              }`}
            />
          </div>

          {step === 1 && (
            <>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Ade Store"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[48px]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!businessName.trim()}
                className="mt-6 w-full rounded-xl bg-slate-900 text-white py-3.5 font-medium disabled:opacity-50 min-h-[48px]"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                WhatsApp / Phone number (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[48px]"
              />
              <p className="mt-2 text-xs text-slate-500">
                Used to prefill WhatsApp when you send invoices.
              </p>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-slate-300 text-slate-700 py-3.5 font-medium min-h-[48px]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-emerald-600 text-white py-3.5 font-medium disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Finish"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
