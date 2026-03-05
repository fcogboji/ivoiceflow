import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeBigInts } from "@/lib/serialize";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { customer: true, items: true, user: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeBigInts(invoice));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { status } = body as { status?: string };

  if (status === "paid" || status === "cancelled") {
    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: status as "paid" | "cancelled",
        ...(status === "paid" ? { paidAt: new Date(), paidVia: "manual" } : {}),
      },
      include: { customer: true, items: true },
    });
    return NextResponse.json(serializeBigInts(updated));
  }

  return NextResponse.json(serializeBigInts(invoice));
}
