import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as {
    event?: string;
    data?: {
      reference?: string;
      metadata?: { invoice_id?: string };
    };
  };

  if (event.event === "charge.success" && event.data?.metadata?.invoice_id) {
    const invoiceId = event.data.metadata.invoice_id;
    const paystackRef = event.data.reference ?? null;
    await prisma.invoice.updateMany({
      where: { id: invoiceId, status: "pending" },
      data: {
        status: "paid",
        paidAt: new Date(),
        paidVia: "paystack",
        ...(paystackRef && { paystackRef }),
      },
    });
  }

  return NextResponse.json({ received: true });
}
