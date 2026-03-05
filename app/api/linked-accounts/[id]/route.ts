import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const account = await prisma.linkedBankAccount.findFirst({
    where: { id, userId: user.id },
  });

  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.linkedBankAccount.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
