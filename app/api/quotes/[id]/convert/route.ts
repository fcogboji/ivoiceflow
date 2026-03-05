import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { vatAmount } from "@/lib/utils";
import { generatePaymentReference } from "@/lib/payment-reference";
import { serializeBigInts } from "@/lib/serialize";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: quoteId } = await params;
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, userId: user.id },
    include: { items: true, customer: true },
  });
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const applyVat = body.applyVat === true;
  const subtotal = Number(quote.total);
  const vat = applyVat ? vatAmount(subtotal) : 0;
  const total = subtotal + vat;

  let paymentReference = generatePaymentReference();
  let exists = await prisma.invoice.findUnique({ where: { paymentReference } });
  while (exists) {
    paymentReference = generatePaymentReference();
    exists = await prisma.invoice.findUnique({ where: { paymentReference } });
  }

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId: quote.customerId,
      total: BigInt(total),
      vatAmount: BigInt(vat),
      paymentReference,
      items: {
        create: quote.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
    include: { customer: true, items: true },
  });

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: "approved" },
  });

  return NextResponse.json({ invoice: serializeBigInts(invoice) });
}
