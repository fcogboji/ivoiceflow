import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center border-b border-slate-200 bg-white/80 backdrop-blur">
        <span className="font-semibold text-lg text-slate-800">InvoiceFlow</span>
        <SignedOut>
          <Link
            href="/sign-in"
            className="text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            Login
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Dashboard
          </Link>
        </SignedIn>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 max-w-lg leading-tight">
          Create invoices in seconds. Send via WhatsApp. Get paid fast.
        </h1>
        <p className="mt-4 text-slate-600 max-w-md">
          Quotes and invoices for Nigerian businesses. Payment links with
          Paystack. PDF downloads. Mobile-first.
        </p>
        <SignedOut>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white px-8 py-4 text-base font-semibold hover:bg-emerald-700 min-h-[48px] min-w-[200px]"
          >
            Start Free
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white px-8 py-4 text-base font-semibold hover:bg-emerald-700 min-h-[48px] min-w-[200px]"
          >
            Go to Dashboard
          </Link>
        </SignedIn>

        <section className="mt-16 md:mt-24 w-full max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-8">How it works</h2>
          <ol className="text-left space-y-6">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                1
              </span>
              <div>
                <p className="font-medium text-slate-900">Create</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  Create an invoice or quote, add items and your bank details. We add a unique payment reference for bank transfers.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                2
              </span>
              <div>
                <p className="font-medium text-slate-900">Share</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  Send the payment link via WhatsApp or copy the link. Customer can pay with Paystack or transfer to your bank.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                3
              </span>
              <div>
                <p className="font-medium text-slate-900">Get paid</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  When payment is received (Paystack or bank transfer), we mark the invoice paid and you get a receipt. No checking bank apps.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </main>

      <footer className="p-4 text-center text-slate-500 text-sm border-t border-slate-200 mt-auto">
        Built for Nigerian SMEs · Naira · VAT 7.5% · Paystack
      </footer>
    </div>
  );
}
