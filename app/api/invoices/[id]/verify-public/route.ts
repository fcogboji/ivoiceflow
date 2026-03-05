import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";

/**
 * Public payment verification. No auth required.
 * Share this URL with customers who claim they paid; it shows only received / not received + minimal details.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const received = invoice.status === "paid";
  const invoiceNumber = invoice.paymentReference ?? id.slice(-6).toUpperCase();

  return NextResponse.json({
    received,
    message: received
      ? `Payment received on ${invoice.paidAt?.toLocaleDateString("en-NG")} via ${invoice.paidVia === "paystack" ? "Paystack" : invoice.paidVia === "bank_transfer" ? "bank transfer" : "payment"}.`
      : "Payment NOT received. No payment has been recorded for this invoice.",
    ...(received && {
      paidAt: invoice.paidAt?.toISOString(),
      paidVia: invoice.paidVia,
      amountFormatted: formatNaira(invoice.total),
      invoiceNumber,
    }),
  });
}
