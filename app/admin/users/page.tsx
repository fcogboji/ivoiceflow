import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { invoices: true, customers: true },
      },
    },
  });

  const userIds = users.map((u) => u.id);
  const revenueByUser = await prisma.invoice.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, status: "paid" },
    _sum: { total: true },
  });
  const revenueMap = new Map(revenueByUser.map((r) => [r.userId, Number(r._sum.total ?? 0)]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Users</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-4 font-semibold text-slate-700">Business</th>
                <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                <th className="text-left p-4 font-semibold text-slate-700">Customers</th>
                <th className="text-left p-4 font-semibold text-slate-700">Invoices</th>
                <th className="text-left p-4 font-semibold text-slate-700">Revenue</th>
                <th className="text-left p-4 font-semibold text-slate-700">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <Link href={`/admin/users/${u.id}`} className="font-medium text-emerald-600 hover:underline">
                      {u.businessName}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-600">{u.email ?? "—"}</td>
                  <td className="p-4">{u._count.customers}</td>
                  <td className="p-4">{u._count.invoices}</td>
                  <td className="p-4 font-medium">{formatNaira(revenueMap.get(u.id) ?? 0)}</td>
                  <td className="p-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
