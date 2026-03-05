import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";

/**
 * Verify whether payment has been received for an invoice.
 * Useful when someone sends a screenshot: call this to confirm "Payment NOT received" or "Payment received".
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { customer: true },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const received = invoice.status === "paid";
  return NextResponse.json({
    received,
    message: received
      ? `Payment received on ${invoice.paidAt?.toLocaleDateString("en-NG")} via ${invoice.paidVia === "paystack" ? "Paystack" : invoice.paidVia === "bank_transfer" ? "bank transfer" : "payment"}.`
      : "Payment NOT received. No payment has been recorded for this invoice.",
    ...(received && {
      paidAt: invoice.paidAt?.toISOString(),
      paidVia: invoice.paidVia,
      amount: Number(invoice.total),
      amountFormatted: formatNaira(invoice.total),
      customer: invoice.customer.name,
      invoiceNumber: invoice.paymentReference ?? invoice.id.slice(-6).toUpperCase(),
    }),
  });
}
