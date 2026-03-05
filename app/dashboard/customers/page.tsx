import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserPlus } from "lucide-react";

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const customers = await prisma.customer.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
        <Link
          href="/dashboard/customers/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-3 font-medium hover:bg-emerald-700 min-h-[48px]"
        >
          <UserPlus className="h-5 w-5" /> Add customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          <p>No customers yet.</p>
          <Link
            href="/dashboard/customers/new"
            className="mt-3 inline-block text-emerald-600 font-medium hover:underline"
          >
            Add your first customer
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/customers/${c.id}`}
                className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-slate-300"
              >
                <div>
                  <p className="font-medium text-slate-900">{c.name}</p>
                  {(c.email || c.phone) && (
                    <p className="text-sm text-slate-500">{c.email || c.phone}</p>
                  )}
                </div>
                <span className="text-sm text-slate-500">
                  {c._count.invoices} invoice{c._count.invoices !== 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
