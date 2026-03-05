import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { businessName, phone } = body as { businessName?: string; phone?: string };

    if (!businessName || typeof businessName !== "string") {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          businessName: businessName.trim(),
          phone: phone?.trim() || null,
          onboardingDone: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          businessName: businessName.trim(),
          phone: phone?.trim() || undefined,
          onboardingDone: true,
        },
      });
    }

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error("Onboarding error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
