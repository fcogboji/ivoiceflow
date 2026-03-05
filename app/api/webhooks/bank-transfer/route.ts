import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Webhook for automatic bank transfer matching.
 * Call from Mono, Okra, or your own job when a transfer is detected.
 *
 * Expected body (JSON):
 * - reference: string (e.g. "INV-A1B2C3" - must match invoice.paymentReference)
 * - amountKobo: number (amount in kobo, must match invoice.total)
 * - provider?: string (e.g. "mono" | "okra")
 *
 * Security: set BANK_TRANSFER_WEBHOOK_SECRET in env and send it in header:
 * x-bank-transfer-secret: <secret>
 */
const WEBHOOK_SECRET = process.env.BANK_TRANSFER_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get("x-bank-transfer-secret");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: { reference?: string; amountKobo?: number; provider?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reference = typeof body.reference === "string" ? body.reference.trim() : null;
  const amountKobo = typeof body.amountKobo === "number" ? Math.round(body.amountKobo) : null;

  if (!reference || amountKobo == null || amountKobo < 1) {
    return NextResponse.json(
      { error: "reference and amountKobo (positive number) required" },
      { status: 400 }
    );
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      paymentReference: reference,
      total: BigInt(amountKobo),
      status: "pending",
    },
    include: { customer: true, user: true },
  });

  if (!invoice) {
    return NextResponse.json(
      { matched: false, message: "No pending invoice found for this reference and amount" },
      { status: 200 }
    );
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "paid",
      paidAt: new Date(),
      paidVia: "bank_transfer",
    },
  });

  return NextResponse.json({
    matched: true,
    invoiceId: invoice.id,
    customer: invoice.customer.name,
    amount: amountKobo,
    message: "Payment received and invoice marked paid.",
  });
}
