import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { vatAmount } from "@/lib/utils";
import { generatePaymentReference } from "@/lib/payment-reference";
import { serializeBigInts } from "@/lib/serialize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true, items: true },
  });
  return NextResponse.json(serializeBigInts(invoices));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    customerId,
    items,
    note,
    dueDate,
    applyVat,
  } = body as {
    customerId: string;
    items: { productName: string; quantity: number; price: number }[];
    note?: string;
    dueDate?: string;
    applyVat?: boolean;
  };

  if (!customerId || !items?.length) {
    return NextResponse.json(
      { error: "Customer and at least one item required" },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, userId: user.id },
  });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const subtotal = items.reduce((sum, i) => sum + (i.quantity || 1) * (i.price || 0), 0);
  const applyVatBool = applyVat === true;
  const vat = applyVatBool ? vatAmount(subtotal) : 0;
  const total = subtotal + vat;

  const totalBigInt = BigInt(total);
  const vatBigInt = BigInt(vat);

  let paymentReference = generatePaymentReference();
  let exists = await prisma.invoice.findUnique({ where: { paymentReference } });
  while (exists) {
    paymentReference = generatePaymentReference();
    exists = await prisma.invoice.findUnique({ where: { paymentReference } });
  }

  try {
  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId,
      total: totalBigInt,
      vatAmount: vatBigInt,
      paymentReference,
      note: note?.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      items: {
        create: items.map((i) => ({
          productName: i.productName || "Item",
          quantity: Math.max(1, Number(i.quantity) || 1),
          price: BigInt(Math.max(0, Number(i.price) || 0)),
        })),
      },
    },
      include: { customer: true, items: true },
    });
    return NextResponse.json(serializeBigInts(invoice));
  } catch (e) {
    console.error("Invoice create error:", e);
    const message = e instanceof Error ? e.message : "Failed to create invoice";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
