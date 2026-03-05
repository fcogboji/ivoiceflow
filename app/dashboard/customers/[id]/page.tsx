import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, userId: user.id },
    include: {
      invoices: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!customer) notFound();

  return (
    <div className="p-4 md:p-6">
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="rounded-xl bg-white border border-slate-200 p-6 mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{customer.name}</h1>
        {customer.email && (
          <p className="text-slate-600 mt-1">{customer.email}</p>
        )}
        {customer.phone && (
          <p className="text-slate-600">{customer.phone}</p>
        )}
        <Link
          href={`/dashboard/invoices/new?customerId=${customer.id}`}
          className="mt-4 inline-block rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
        >
          Create invoice
        </Link>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Invoices</h2>
      {customer.invoices.length === 0 ? (
        <p className="text-slate-500 text-sm">No invoices yet.</p>
      ) : (
        <ul className="space-y-2">
          {customer.invoices.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/dashboard/invoices/${inv.id}`}
                className="flex justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-slate-300"
              >
                <span className="font-medium text-slate-900">
                  {formatNaira(inv.total)}
                </span>
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
      )}
    </div>
  );
}
