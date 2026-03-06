import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy – InvoiceFlow",
  description: "How we use cookies on InvoiceFlow.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Cookie Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: March 2025
        </p>

        <div className="mt-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              What are cookies?
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Cookies are small text files stored on your device when you visit a
              website. They help the site work properly, remember your
              preferences, and understand how you use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              How we use cookies
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We use cookies to improve your experience on InvoiceFlow, to keep
              you signed in, to analyse how the app is used, and in some cases to
              show relevant advertising. You can accept all cookies, reject
              non-essential cookies, or manage your preferences from the cookie
              banner.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              Your choices
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              You can change your cookie preferences at any time. Essential
              cookies are required for the app to function (e.g. authentication).
              Other cookies are optional and can be disabled.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              Contact
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If you have questions about this cookie policy, please contact us
              through the app or your usual support channel.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
