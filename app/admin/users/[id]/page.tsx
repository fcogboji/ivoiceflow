import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { invoices: true, customers: true } },
    },
  });
  if (!user) notFound();

  const [revenue, invoices] = await Promise.all([
    prisma.invoice.aggregate({
      where: { userId: id, status: "paid" },
      _sum: { total: true },
    }),
    prisma.invoice.findMany({
      where: { userId: id },
      take: 30,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const totalRevenue = Number(revenue._sum.total ?? 0);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{user.businessName}</h1>
        <p className="text-slate-600 mt-1">{user.email ?? "No email"}</p>
        <p className="text-slate-500 text-sm mt-1">
          Clerk ID: <code className="bg-slate-100 px-1 rounded">{user.clerkId}</code>
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="text-slate-600">Customers: <strong>{user._count.customers}</strong></span>
          <span className="text-slate-600">Invoices: <strong>{user._count.invoices}</strong></span>
          <span className="text-slate-600">Total revenue: <strong>{formatNaira(totalRevenue)}</strong></span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="p-4 border-b border-slate-200 font-semibold text-slate-900">Recent invoices</h2>
        <ul className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/admin/invoices?highlight=${inv.id}`}
                className="flex justify-between items-center p-4 hover:bg-slate-50"
              >
                <span className="text-slate-900">{inv.customer.name}</span>
                <span className="text-slate-600">{formatNaira(Number(inv.total))}</span>
                <span
                  className={`text-sm ${
                    inv.status === "paid" ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {inv.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
