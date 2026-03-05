import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { FileText, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenueToday, revenueWeek, revenueMonth, pendingCount, recentInvoices, recentPayments] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        userId: user.id,
        status: "paid",
        paidAt: { gte: startOfToday },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId: user.id,
        status: "paid",
        paidAt: { gte: startOfWeek },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId: user.id,
        status: "paid",
        paidAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    }),
    prisma.invoice.count({
      where: { userId: user.id, status: "pending" },
    }),
    prisma.invoice.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.invoice.findMany({
      where: { userId: user.id, status: "paid", paidAt: { not: null } },
      take: 10,
      orderBy: { paidAt: "desc" },
      include: { customer: true },
    }),
  ]);

  const todayAmount = revenueToday._sum.total ?? BigInt(0);
  const weekAmount = revenueWeek._sum.total ?? BigInt(0);
  const monthAmount = revenueMonth._sum.total ?? BigInt(0);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
        {user.businessName}
      </h1>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-slate-600 mb-3">Revenue analytics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Today</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatNaira(todayAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">This week</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatNaira(weekAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">This month</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatNaira(monthAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Pending invoices</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{pendingCount}</p>
          </div>
        </div>
      </div>

      {recentPayments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Payment received</h2>
          <p className="text-sm text-slate-600 mb-3">
            Automatic payment confirmation. When we detect a transfer (Paystack or bank), the invoice is marked paid. No checking bank apps.
          </p>
          <ul className="space-y-2 mb-6">
            {recentPayments.map((inv) => {
              const invNum = inv.paymentReference ?? inv.id.slice(-6).toUpperCase();
              return (
                <li key={inv.id}>
                  <Link
                    href={`/dashboard/invoices/${inv.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-4 hover:bg-emerald-100/80 transition"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        Payment received
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        Customer: {inv.customer.name} · Amount: {formatNaira(inv.total)} · Invoice: {invNum}
                      </p>
                    </div>
                    <span className="text-xs text-emerald-700 font-medium shrink-0">
                      {inv.paidVia === "bank_transfer" ? "Bank transfer" : inv.paidVia === "paystack" ? "Paystack" : "Paid"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent invoices</h2>
          <Link
            href="/dashboard/invoices"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-2" />
            <p>No invoices yet.</p>
            <Link
              href="/dashboard/invoices/new"
              className="mt-3 inline-block text-emerald-600 font-medium hover:underline"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {recentInvoices.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/dashboard/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        inv.status === "paid" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-slate-900">{inv.customer.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatNaira(inv.total)}
                        {Number(inv.vatAmount) > 0 && ` (incl. VAT)`}
                        {inv.paidVia === "bank_transfer" && inv.status === "paid" && (
                          <span className="text-emerald-600"> · Bank transfer</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      inv.status === "paid" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {inv.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
