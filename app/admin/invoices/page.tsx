import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; highlight?: string }>;
}) {
  const { status, highlight } = await searchParams;

  const where =
    status === "paid"
      ? { status: "paid" as const }
      : status === "pending"
        ? { status: "pending" as const }
        : {};

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { businessName: true } },
      customer: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">All invoices</h1>

      <div className="flex gap-2">
        <Link
          href="/admin/invoices"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            !status ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/invoices?status=paid"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            status === "paid" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Paid
        </Link>
        <Link
          href="/admin/invoices?status=pending"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            status === "pending" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Pending
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-4 font-semibold text-slate-700">Business</th>
                <th className="text-left p-4 font-semibold text-slate-700">Customer</th>
                <th className="text-left p-4 font-semibold text-slate-700">Amount</th>
                <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                <th className="text-left p-4 font-semibold text-slate-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${
                    highlight === inv.id ? "bg-amber-50" : ""
                  }`}
                >
                  <td className="p-4">
                    <Link
                      href={`/admin/users/${inv.userId}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {inv.user.businessName}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-700">{inv.customer.name}</td>
                  <td className="p-4 font-medium">{formatNaira(Number(inv.total))}</td>
                  <td className="p-4">
                    <span
                      className={
                        inv.status === "paid"
                          ? "text-emerald-600 font-medium"
                          : "text-amber-600 font-medium"
                      }
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(inv.createdAt).toLocaleDateString()}
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
