import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeBigInts } from "@/lib/serialize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotes = await prisma.quote.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true, items: true },
  });
  return NextResponse.json(serializeBigInts(quotes));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    customerId,
    items,
    note,
    validUntil,
    sellerSignatureData,
  } = body as {
    customerId: string;
    items: { productName: string; quantity: number; price: number }[];
    note?: string;
    validUntil?: string;
    sellerSignatureData?: string | null;
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

  const total = items.reduce((sum, i) => sum + (i.quantity || 1) * (i.price || 0), 0);

  const quote = await prisma.quote.create({
    data: {
      userId: user.id,
      customerId,
      total: BigInt(total),
      note: note?.trim() || undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      sellerSignatureData: sellerSignatureData && typeof sellerSignatureData === "string" ? sellerSignatureData : undefined,
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
  return NextResponse.json(serializeBigInts(quote));
}
