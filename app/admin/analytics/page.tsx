import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const invoicesByMonth = await prisma.$queryRaw<
    { month: string; count: bigint; revenue: bigint }[]
  >`
    SELECT
      to_char(date_trunc('month', "paidAt"), 'YYYY-MM') as month,
      COUNT(*)::bigint as count,
      COALESCE(SUM(total), 0)::bigint as revenue
    FROM "Invoice"
    WHERE status = 'paid' AND "paidAt" IS NOT NULL
    GROUP BY date_trunc('month', "paidAt")
    ORDER BY month DESC
    LIMIT 12
  `.catch(() => []);

  const newUsersByMonth = await prisma.$queryRaw<
    { month: string; count: bigint }[]
  >`
    SELECT
      to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as month,
      COUNT(*)::bigint as count
    FROM "User"
    GROUP BY date_trunc('month', "createdAt")
    ORDER BY month DESC
    LIMIT 12
  `.catch(() => []);

  const topBusinesses = await prisma.invoice.groupBy({
    by: ["userId"],
    where: { status: "paid" },
    _sum: { total: true },
    _count: true,
  });

  const userIds = topBusinesses.map((t) => t.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, businessName: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.businessName]));

  const topByRevenue = topBusinesses
    .map((t) => ({
      userId: t.userId,
      businessName: userMap.get(t.userId) ?? "Unknown",
      revenue: Number(t._sum.total ?? 0),
      invoiceCount: t._count,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="p-4 border-b border-slate-200 font-semibold text-slate-900">
          Revenue & invoices by month (paid)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-4 font-semibold text-slate-700">Month</th>
                <th className="text-right p-4 font-semibold text-slate-700">Invoices</th>
                <th className="text-right p-4 font-semibold text-slate-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {invoicesByMonth.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="p-4 font-medium">{row.month}</td>
                  <td className="p-4 text-right">{Number(row.count)}</td>
                  <td className="p-4 text-right font-medium">{formatNaira(Number(row.revenue))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="p-4 border-b border-slate-200 font-semibold text-slate-900">
          New users by month
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-4 font-semibold text-slate-700">Month</th>
                <th className="text-right p-4 font-semibold text-slate-700">New users</th>
              </tr>
            </thead>
            <tbody>
              {newUsersByMonth.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="p-4 font-medium">{row.month}</td>
                  <td className="p-4 text-right">{Number(row.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="p-4 border-b border-slate-200 font-semibold text-slate-900">
          Top 10 businesses by revenue
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-4 font-semibold text-slate-700">Business</th>
                <th className="text-right p-4 font-semibold text-slate-700">Invoices</th>
                <th className="text-right p-4 font-semibold text-slate-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topByRevenue.map((row) => (
                <tr key={row.userId} className="border-b border-slate-100">
                  <td className="p-4">
                    <a
                      href={`/admin/users/${row.userId}`}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      {row.businessName}
                    </a>
                  </td>
                  <td className="p-4 text-right">{row.invoiceCount}</td>
                  <td className="p-4 text-right font-medium">{formatNaira(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
