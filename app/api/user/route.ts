import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    businessName,
    phone,
    logoUrl,
    cacNumber,
    tinNumber,
    paymentProvider,
    paystackSecret,
    whatsappTemplate,
    bankAccountNumber,
    bankName,
    bankAccountName,
  } = body as {
    businessName?: string;
    phone?: string;
    logoUrl?: string;
    cacNumber?: string;
    tinNumber?: string;
    paymentProvider?: string;
    paystackSecret?: string;
    whatsappTemplate?: string;
    bankAccountNumber?: string;
    bankName?: string;
    bankAccountName?: string;
  };

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(typeof businessName === "string" && { businessName: businessName.trim() }),
      ...(typeof phone === "string" && { phone: phone.trim() || null }),
      ...(logoUrl !== undefined &&
        (logoUrl === null || logoUrl === ""
          ? { logoUrl: null }
          : typeof logoUrl === "string"
            ? { logoUrl: logoUrl.trim() || null }
            : {})),
      ...(typeof cacNumber === "string" && { cacNumber: cacNumber.trim() || null }),
      ...(typeof tinNumber === "string" && { tinNumber: tinNumber.trim() || null }),
      ...(paymentProvider === "paystack" || paymentProvider === "flutterwave"
        ? { paymentProvider }
        : {}),
      ...(typeof paystackSecret === "string" && { paystackSecret: paystackSecret.trim() || null }),
      ...(typeof whatsappTemplate === "string" && { whatsappTemplate: whatsappTemplate.trim() || null }),
      ...(typeof bankAccountNumber === "string" && { bankAccountNumber: bankAccountNumber.trim() || null }),
      ...(typeof bankName === "string" && { bankName: bankName.trim() || null }),
      ...(typeof bankAccountName === "string" && { bankAccountName: bankAccountName.trim() || null }),
    },
  });

  return NextResponse.json(updated);
}
