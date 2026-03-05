import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeBigInts } from "@/lib/serialize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(serializeBigInts(products));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, price } = body as {
    name?: string;
    description?: string;
    price?: number;
  };
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const priceKobo = typeof price === "number" && price >= 0 ? Math.round(price) : 0;

  const product = await prisma.product.create({
    data: {
      userId: user.id,
      name: name.trim(),
      description: typeof description === "string" ? description.trim() || undefined : undefined,
      price: BigInt(priceKobo),
    },
  });
  return NextResponse.json(serializeBigInts(product));
}
