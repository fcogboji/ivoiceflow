import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { ArrowLeft, Share2 } from "lucide-react";
import { InvoiceActions } from "@/components/invoice/InvoiceActions";
import { WhatsAppShareButton } from "@/components/invoice/WhatsAppShareButton";
import { BankTransferInstructions } from "@/components/invoice/BankTransferInstructions";
import { InvoicePrintLayout } from "@/components/invoice/InvoicePrintLayout";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;

  const [invoice, linkedAccounts] = await Promise.all([
    prisma.invoice.findFirst({
      where: { id, userId: user.id },
      include: { customer: true, items: true, user: true },
    }),
    prisma.linkedBankAccount.findMany({
      where: { userId: user.id, isActive: true },
      select: { bankName: true, accountNumber: true, accountName: true },
    }),
  ]);
  if (!invoice) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const payLink = `${baseUrl}/pay/${invoice.id}`;

  const subtotal = Number(invoice.total) - Number(invoice.vatAmount);
  const dueLabel = invoice.dueDate
    ? `Due ${invoice.dueDate.toLocaleDateString("en-NG")}`
    : "Due Upon Receipt";

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-6 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> Back to invoices
      </Link>

      <div className="mb-8 print:mb-0">
        <InvoicePrintLayout
          type="invoice"
          number={invoice.paymentReference ?? invoice.id.slice(-6).toUpperCase()}
          issuedDate={invoice.createdAt.toLocaleDateString("en-NG")}
          dueLabel={dueLabel}
          business={{
            businessName: user.businessName,
            logoUrl: user.logoUrl,
            phone: user.phone,
            email: user.email,
          }}
          customer={{
            name: invoice.customer.name,
            phone: invoice.customer.phone,
            email: invoice.customer.email,
          }}
          items={invoice.items.map((i) => ({
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
          }))}
          subtotal={subtotal}
          vatAmount={invoice.vatAmount}
          total={invoice.total}
          paymentLink={invoice.status === "pending" ? payLink : undefined}
          note={invoice.note}
          status={invoice.status}
        />
      </div>

      <div className="mt-6 print:hidden">
        {invoice.status === "paid" ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <p className="font-medium text-emerald-800">Payment received</p>
            <p className="text-sm text-emerald-700 mt-1">
              {invoice.paidAt?.toLocaleDateString("en-NG")} via {invoice.paidVia === "paystack" ? "Paystack" : invoice.paidVia === "bank_transfer" ? "bank transfer" : "payment"}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="font-medium text-amber-800">Payment NOT received</p>
            <p className="text-sm text-amber-700 mt-1">
              No payment has been recorded for this invoice. If the customer sent a screenshot, verify with the payment verification link or your bank.
            </p>
          </div>
        )}
      </div>

      {invoice.status === "pending" && (
        <div className="mt-6 print:hidden">
          <BankTransferInstructions
            amount={Number(invoice.total)}
            paymentReference={invoice.paymentReference}
            bankAccountNumber={user.bankAccountNumber}
            bankName={user.bankName}
            bankAccountName={user.bankAccountName}
            extraAccounts={linkedAccounts}
          />
        </div>
      )}

      <div className="mt-6 space-y-3 print:hidden">
        <p className="text-sm font-medium text-slate-700">Share & collect payment</p>
        <div className="flex flex-wrap gap-3">
          <WhatsAppShareButton
            customerName={invoice.customer.name}
            customerPhone={invoice.customer.phone}
            amount={formatNaira(invoice.total)}
            invoiceLink={payLink}
            customTemplate={user.whatsappTemplate}
          />
          <InvoiceActions
            invoiceId={invoice.id}
            status={invoice.status}
            payLink={payLink}
            verifyLink={`${baseUrl}/verify/${invoice.id}`}
          />
        </div>
        {!invoice.customer.phone && (
          <p className="text-xs text-slate-500">
            Add customer phone in Customers to prefill their number for WhatsApp.
          </p>
        )}
      </div>

      {/* Viral referral */}
      <div className="mt-8 rounded-xl bg-slate-100 p-4 print:hidden">
        <p className="text-sm text-slate-700 mb-2">
          Share InvoiceFlow with other business owners?
        </p>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            "Hey! I've been using InvoiceFlow to send invoices to my customers. It's free and fast: " + (baseUrl || "https://invoiceflow.ng")
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline"
        >
          <Share2 className="h-4 w-4" /> Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
