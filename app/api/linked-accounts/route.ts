import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.linkedBankAccount.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { bankName?: string; accountNumber?: string; accountName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bankName = typeof body.bankName === "string" ? body.bankName.trim() : "";
  const accountNumber = typeof body.accountNumber === "string" ? body.accountNumber.trim().replace(/\s/g, "") : "";
  const accountName = typeof body.accountName === "string" ? body.accountName.trim() : "";

  if (!bankName || !accountNumber || !accountName) {
    return NextResponse.json(
      { error: "bankName, accountNumber, and accountName are required" },
      { status: 400 }
    );
  }

  const accountId = `manual-${randomBytes(8).toString("hex")}`;

  const account = await prisma.linkedBankAccount.create({
    data: {
      userId: user.id,
      provider: "manual",
      accountId,
      accountNumber,
      bankName,
      accountName,
      isActive: true,
    },
  });

  return NextResponse.json(account);
}
