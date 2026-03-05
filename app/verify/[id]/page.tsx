import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function VerifyPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: {
      status: true,
      paidAt: true,
      paidVia: true,
      total: true,
      paymentReference: true,
    },
  });

  if (!invoice) notFound();

  const received = invoice.status === "paid";
  const invoiceNumber = invoice.paymentReference ?? id.slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
        {received ? (
          <>
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" aria-hidden />
            <h1 className="text-xl font-semibold text-slate-900 mt-4">Payment received</h1>
            <p className="text-slate-600 mt-2">
              Payment was recorded on {invoice.paidAt?.toLocaleDateString("en-NG")} via{" "}
              {invoice.paidVia === "paystack" ? "Paystack" : invoice.paidVia === "bank_transfer" ? "bank transfer" : "payment"}.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Invoice {invoiceNumber} · {formatNaira(invoice.total)}
            </p>
          </>
        ) : (
          <>
            <XCircle className="h-14 w-14 text-amber-500 mx-auto" aria-hidden />
            <h1 className="text-xl font-semibold text-slate-900 mt-4">Payment NOT received</h1>
            <p className="text-slate-600 mt-2">
              No payment has been recorded for this invoice. If you already paid, please ensure you used the correct reference and allow time for the transfer to be matched.
            </p>
            <p className="mt-3 text-sm text-slate-500">Invoice {invoiceNumber}</p>
          </>
        )}
      </div>
      <p className="mt-8 text-sm text-slate-500">
        Powered by{" "}
        <Link href="/" className="text-emerald-600 hover:underline">
          InvoiceFlow
        </Link>
        {" "}· Nigeria
      </p>
    </div>
  );
}
