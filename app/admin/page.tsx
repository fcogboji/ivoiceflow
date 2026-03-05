import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { Users, FileText, Banknote, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    totalInvoices,
    paidInvoicesCount,
    revenueAllTime,
    revenueThisMonth,
    revenueLastMonth,
    recentUsers,
    recentInvoices,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "paid" } }),
    prisma.invoice.aggregate({
      where: { status: "paid" },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { status: "paid", paidAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { status: "paid", paidAt: { gte: startOfLastMonth, lt: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, businessName: true, email: true, createdAt: true },
    }),
    prisma.invoice.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { businessName: true } }, customer: { select: { name: true } } },
    }),
  ]);

  const revAll = Number(revenueAllTime._sum.total ?? 0);
  const revMonth = Number(revenueThisMonth._sum.total ?? 0);
  const revLastMonth = Number(revenueLastMonth._sum.total ?? 0);
  const monthGrowth =
    revLastMonth > 0 ? (((revMonth - revLastMonth) / revLastMonth) * 100).toFixed(1) : "—";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Users className="h-4 w-4" />
            Total users
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <FileText className="h-4 w-4" />
            Total invoices
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalInvoices}</p>
          <p className="text-sm text-slate-500">{paidInvoicesCount} paid</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Banknote className="h-4 w-4" />
            Revenue (all time)
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatNaira(revAll)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <TrendingUp className="h-4 w-4" />
            Revenue this month
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatNaira(revMonth)}</p>
          <p className="text-sm text-slate-500">
            {monthGrowth !== "—" ? `${monthGrowth}% vs last month` : "First month"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Recent users</h2>
            <Link href="/admin/users" className="text-sm text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentUsers.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/admin/users/${u.id}`}
                  className="flex justify-between items-center p-4 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{u.businessName}</span>
                  <span className="text-sm text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Recent invoices</h2>
            <Link href="/admin/invoices" className="text-sm text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentInvoices.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/admin/invoices?highlight=${inv.id}`}
                  className="flex justify-between items-center p-4 hover:bg-slate-50"
                >
                  <div>
                    <span className="font-medium text-slate-900">{inv.user.businessName}</span>
                    <span className="text-slate-500"> → {inv.customer.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {formatNaira(Number(inv.total))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
