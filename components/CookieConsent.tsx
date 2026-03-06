"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "fino-cookie-consent";

type ConsentStatus = "accepted" | "rejected" | "managed" | null;

export function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus | null;
    if (stored === "accepted" || stored === "rejected" || stored === "managed") {
      setStatus(stored);
    }
  }, [mounted]);

  const hide = (value: ConsentStatus) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, value!);
    setStatus(value);
  };

  if (!mounted || status !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4 md:px-6 md:py-4"
    >
      <div className="mx-auto max-w-4xl rounded-t-2xl bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] sm:px-6 sm:py-5 md:rounded-t-xl">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          We value your privacy
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:mt-2">
          We use cookies to improve your experience on our website, to show you
          personalised ads, and to analyse our web traffic. By clicking &quot;Accept
          all&quot; you allow us to use cookies. You can change your preferences
          anytime.
        </p>
        <Link
          href="/cookie-policy"
          className="mt-1 inline-block text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
        >
          Cookie Policy
        </Link>

        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={() => hide("managed")}
            className="min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 sm:min-h-0 sm:py-2"
          >
            Manage cookies
          </button>
          <button
            type="button"
            onClick={() => hide("rejected")}
            className="min-h-[44px] rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:bg-slate-900 sm:min-h-0 sm:py-2"
          >
            Reject all cookies
          </button>
          <button
            type="button"
            onClick={() => hide("accepted")}
            className="min-h-[44px] rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:bg-slate-900 sm:min-h-0 sm:py-2"
          >
            Accept all cookies
          </button>
        </div>
      </div>
    </div>
  );
}
