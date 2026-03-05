import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  const pending = invoices.filter((i) => i.status === "pending");
  const paid = invoices.filter((i) => i.status === "paid");

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Invoices</h1>

      {invoices.length === 0 ? (
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
        <>
          {pending.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-medium text-slate-500 mb-2">Pending</h2>
              <ul className="space-y-2">
                {pending.map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <div>
                          <p className="font-medium text-slate-900">{inv.customer.name}</p>
                          <p className="text-sm text-slate-500">{formatNaira(inv.total)}</p>
                        </div>
                      </div>
                      <span className="text-sm text-amber-600 font-medium">Pending</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {paid.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-slate-500 mb-2">Paid</h2>
              <ul className="space-y-2">
                {paid.map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-medium text-slate-900">{inv.customer.name}</p>
                          <p className="text-sm text-slate-500">{formatNaira(inv.total)}</p>
                        </div>
                      </div>
                      <span className="text-sm text-emerald-600 font-medium">Paid</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
