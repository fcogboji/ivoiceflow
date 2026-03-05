import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function QuotesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const quotes = await prisma.quote.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  const statusColor: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Quotes</h1>
        <Link
          href="/dashboard/quotes/new"
          className="rounded-xl bg-emerald-600 text-white px-4 py-3 font-medium hover:bg-emerald-700 min-h-[48px]"
        >
          New quote
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          <FileText className="h-12 w-12 mx-auto text-slate-300 mb-2" />
          <p>No quotes yet.</p>
          <Link
            href="/dashboard/quotes/new"
            className="mt-3 inline-block text-emerald-600 font-medium hover:underline"
          >
            Create your first quote
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {quotes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/dashboard/quotes/${q.id}`}
                className="flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 hover:border-slate-300"
              >
                <div>
                  <p className="font-medium text-slate-900">{q.customer.name}</p>
                  <p className="text-sm text-slate-500">{formatNaira(q.total)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor[q.status] ?? "bg-slate-100 text-slate-700"}`}
                >
                  {q.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
