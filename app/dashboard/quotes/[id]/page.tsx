import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import { ConvertQuoteToInvoice } from "@/components/quote/ConvertQuoteToInvoice";
import { QuotePrintLayout } from "@/components/quote/QuotePrintLayout";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;

  const quote = await prisma.quote.findFirst({
    where: { id, userId: user.id },
    include: { customer: true, items: true },
  });
  if (!quote) notFound();

  const validUntilStr = quote.validUntil
    ? quote.validUntil.toLocaleDateString("en-NG")
    : null;

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <Link
        href="/dashboard/quotes"
        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-6 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> Back to quotes
      </Link>

      <div className="mb-8">
        <QuotePrintLayout
          number={`QUOTE-${quote.id.slice(-6).toUpperCase()}`}
          issuedDate={quote.createdAt.toLocaleDateString("en-NG")}
          validUntil={validUntilStr}
          business={{
            businessName: user.businessName,
            logoUrl: user.logoUrl,
            phone: user.phone,
            email: user.email,
          }}
          customer={{
            name: quote.customer.name,
            phone: quote.customer.phone,
            email: quote.customer.email,
          }}
          items={quote.items.map((i) => ({
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
          }))}
          total={quote.total}
          note={quote.note}
          status={quote.status}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-center print:hidden">
        <a
          href={`/api/quotes/${quote.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-700 px-4 py-3 font-medium hover:bg-slate-50 min-h-[48px]"
        >
          Print / Save PDF
        </a>
        <ConvertQuoteToInvoice quoteId={quote.id} status={quote.status} />
      </div>
    </div>
  );
}
