import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { PayButton } from "@/components/pay/PayButton";
import { BankTransferInstructions } from "@/components/invoice/BankTransferInstructions";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ verified?: string }>;
}) {
  const { id } = await params;
  const { verified } = await searchParams;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, user: true, items: true },
  });

  if (!invoice) notFound();

  const linkedAccounts = invoice.userId
    ? await prisma.linkedBankAccount.findMany({
        where: { userId: invoice.userId, isActive: true },
        select: { bankName: true, accountNumber: true, accountName: true },
      })
    : [];
  if (invoice.status !== "pending") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="rounded-xl bg-white border border-slate-200 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-slate-900">Invoice already paid</h1>
          <p className="mt-2 text-slate-600">This invoice has been settled.</p>
        </div>
        <p className="mt-8 text-sm text-slate-500">
          Powered by InvoiceFlow · Nigeria
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 pb-12">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-lg font-semibold text-slate-900">
              {invoice.user.businessName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Invoice for {invoice.customer.name}</p>
          </div>
          <div className="p-6 space-y-4">
            <ul className="space-y-2">
              {invoice.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatNaira(Number(item.price) * item.quantity)}</span>
                </li>
              ))}
            </ul>
            {Number(invoice.vatAmount) > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>VAT 7.5%</span>
                <span>{formatNaira(invoice.vatAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>{formatNaira(invoice.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <BankTransferInstructions
            amount={Number(invoice.total)}
            paymentReference={invoice.paymentReference}
            bankAccountNumber={invoice.user.bankAccountNumber}
            bankName={invoice.user.bankName}
            bankAccountName={invoice.user.bankAccountName}
            extraAccounts={linkedAccounts}
          />
        </div>

        <div className="mt-6">
          <PayButton
            invoiceId={invoice.id}
            amount={Number(invoice.total)}
            customerEmail={invoice.customer.email ?? undefined}
          />
        </div>

        {verified === "1" && (
          <p className="mt-4 text-center text-sm text-emerald-600">
            Payment verified. Thank you!
          </p>
        )}
      </div>

      <footer className="mt-auto pt-8 text-center text-sm text-slate-500">
        Pay securely with Paystack · Powered by{" "}
        <a
          href="/"
          className="text-emerald-600 hover:underline"
        >
          InvoiceFlow.ng
        </a>
        {" "}– create your own invoices instantly
      </footer>
    </div>
  );
}
