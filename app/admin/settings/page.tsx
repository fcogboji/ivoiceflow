import { requireAdmin } from "@/lib/admin";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin settings</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-xl">
        <h2 className="font-semibold text-slate-900 mb-2">Admin access</h2>
        <p className="text-sm text-slate-600 mb-4">
          Only users whose email is listed in <code className="bg-slate-100 px-1 rounded">ADMIN_EMAILS</code> can
          access <code className="bg-slate-100 px-1 rounded">/admin</code>. Set this in your environment (e.g. .env).
        </p>
        <p className="text-sm text-slate-600 mb-2">Example:</p>
        <pre className="bg-slate-100 p-3 rounded-lg text-sm overflow-x-auto">
          ADMIN_EMAILS=owner@yourdomain.com,other@yourdomain.com
        </pre>
        <p className="text-sm text-slate-500 mt-4">
          Currently {emails.length} email(s) configured. Your email (
          {admin?.emailAddresses?.[0]?.emailAddress ?? "—"}) is allowed.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-xl">
        <h2 className="font-semibold text-slate-900 mb-2">App config</h2>
        <p className="text-sm text-slate-600">
          Other app-wide settings (maintenance mode, feature flags, etc.) can be added here or in
          environment variables and read in this page.
        </p>
      </div>
    </div>
  );
}
