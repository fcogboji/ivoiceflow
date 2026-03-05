import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await prisma.customer.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { invoices: true } },
    },
  });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, phone } = body as { name?: string; email?: string; phone?: string };
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      userId: user.id,
      name: name.trim(),
      email: typeof email === "string" ? email.trim() || undefined : undefined,
      phone: typeof phone === "string" ? phone.trim() || undefined : undefined,
    },
  });
  return NextResponse.json(customer);
}
