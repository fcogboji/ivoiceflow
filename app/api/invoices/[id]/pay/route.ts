import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Initialize Paystack transaction for an invoice. Public-ish: we verify invoice exists and return auth url. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params;
  const body = await req.json();
  const { email } = body as { email?: string };

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, status: "pending" },
    include: { customer: true, user: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found or already paid" }, { status: 404 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY || invoice.user.paystackSecret;
  if (!secret) {
    return NextResponse.json(
      { error: "Payment not configured. Seller needs to add Paystack keys." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${baseUrl}/pay/${invoiceId}?verified=1`;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email || invoice.customer.email || "customer@example.com",
      amount: Number(invoice.total), // Paystack expects kobo (number)
      reference: `inv-${invoice.id}-${Date.now()}`,
      callback_url: callbackUrl,
      metadata: {
        invoice_id: invoice.id,
        customer_id: invoice.customerId,
      },
    }),
  });

  const data = (await res.json()) as {
    status: boolean;
    data?: { authorization_url: string; reference: string };
    message?: string;
  };

  if (!data.status || !data.data?.authorization_url) {
    return NextResponse.json(
      { error: data.message || "Failed to initialize payment" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
  });
}
