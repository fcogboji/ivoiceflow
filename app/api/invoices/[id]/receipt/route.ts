import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";

const DEFAULT_BRAND = "#1e3a5f";
const DEFAULT_BRAND_LIGHT = "#3b82b6";
function brandColors(brandColor: string | null | undefined) {
  const valid = brandColor && /^#[0-9A-Fa-f]{6}$/.test(brandColor);
  return { primary: valid ? brandColor! : DEFAULT_BRAND, secondary: valid ? brandColor! : DEFAULT_BRAND_LIGHT };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { customer: true, items: true },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status !== "paid") {
    return NextResponse.json(
      { error: "Receipt is only available for paid invoices" },
      { status: 400 }
    );
  }

  const subtotal = Number(invoice.total) - Number(invoice.vatAmount);
  const invNumber = invoice.paymentReference ?? invoice.id.slice(-6).toUpperCase();
  const paidDate = invoice.paidAt
    ? invoice.paidAt.toLocaleDateString("en-NG", { dateStyle: "long" })
    : "";
  const paymentMethod =
    invoice.paidVia === "paystack"
      ? "Paystack"
      : invoice.paidVia === "bank_transfer"
        ? "Bank transfer"
        : "Payment";

  const { primary, secondary } = brandColors(user.brandColor);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${escapeHtml(invNumber)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 32px; color: #1e293b; }
    .top-bar { height: 8px; background: linear-gradient(90deg, ${primary} 0%, ${secondary} 50%, ${primary} 100%); margin: -24px -32px 24px -32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .header-logo { height: 72px; width: auto; max-width: 200px; object-fit: contain; margin-bottom: 8px; }
    .business-name { font-size: 1.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: ${primary}; }
    .divider { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
    .divider-line { height: 1px; width: 100px; background: ${secondary}; }
    .title-right { text-align: right; }
    .receipt-title { font-size: 1.75rem; font-weight: 700; text-transform: uppercase; color: ${primary}; }
    .receipt-num { font-size: 0.875rem; color: ${secondary}; margin-top: 4px; }
    .paid-badge { display: inline-block; margin-top: 8px; padding: 6px 14px; border-radius: 9999px; font-size: 0.8125rem; font-weight: 600; background: #d1fae5; color: #065f46; }
    .meta { font-size: 0.875rem; color: #475569; margin-top: 6px; }
    .bill-section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .bill-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    .bill-name { font-weight: 600; color: #1e293b; }
    .bill-detail { font-size: 0.875rem; color: #475569; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    thead tr { background: ${primary}; color: white; }
    th { padding: 12px 16px; font-size: 0.8125rem; font-weight: 600; text-align: left; }
    th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
    th:nth-child(5) { text-align: right; }
    td { padding: 12px 16px; font-size: 0.875rem; border-bottom: 1px solid #f1f5f9; }
    td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: center; }
    td:nth-child(5) { text-align: right; font-weight: 500; }
    tbody tr:nth-child(odd) { background: #f8fafc; }
    tbody tr:nth-child(even) { background: #f1f5f9; }
    .summary { margin-top: 24px; display: flex; justify-content: flex-end; }
    .summary-inner { width: 280px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 8px; }
    .summary-row .label { color: #64748b; }
    .summary-row .val { font-weight: 600; }
    .summary-total { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 12px; border-top: 2px solid ${secondary}; font-weight: 700; font-size: 1.125rem; }
    .summary-total .val { color: ${primary}; }
    .thank-you { margin-top: 32px; padding: 20px; text-align: center; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 1rem; font-weight: 600; color: #166534; }
    .footer { margin-top: 32px; font-size: 0.75rem; color: #94a3b8; text-align: center; }
    @media print { body { padding: 16px; } .top-bar { margin: -16px -16px 20px -16px; } }
  </style>
</head>
<body>
  <div class="top-bar"></div>
  <div class="header">
    <div>
      ${user.logoUrl ? `<img src="${user.logoUrl.replace(/"/g, "&quot;")}" alt="" class="header-logo" />` : ""}
      <h1 class="business-name">${escapeHtml(user.businessName)}</h1>
      <div class="divider">
        <span class="divider-line"></span>
        <span style="color:${secondary}">●</span>
        <span class="divider-line"></span>
      </div>
    </div>
    <div class="title-right">
      <p class="receipt-title">Receipt</p>
      <p class="receipt-num">#${escapeHtml(invNumber)}</p>
      <p class="meta">Paid on ${escapeHtml(paidDate)}</p>
      <p class="meta">Payment method: ${escapeHtml(paymentMethod)}</p>
      <span class="paid-badge">Paid</span>
    </div>
  </div>
  <div class="bill-section">
    <div>
      <p class="bill-label">From</p>
      <p class="bill-name">${escapeHtml(user.businessName)}</p>
      ${user.phone ? `<p class="bill-detail">${escapeHtml(user.phone)}</p>` : ""}
      ${user.email ? `<p class="bill-detail">${escapeHtml(user.email)}</p>` : ""}
    </div>
    <div>
      <p class="bill-label">To</p>
      <p class="bill-name">${escapeHtml(invoice.customer.name)}</p>
      ${invoice.customer.phone ? `<p class="bill-detail">${escapeHtml(invoice.customer.phone)}</p>` : ""}
      ${invoice.customer.email ? `<p class="bill-detail">${escapeHtml(invoice.customer.email)}</p>` : ""}
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th>QTY</th><th>Price</th><th>Tax</th><th>Amount</th></tr></thead>
    <tbody>
      ${invoice.items.map((i) => `<tr><td>${escapeHtml(i.productName)}</td><td>${i.quantity}</td><td>${formatNaira(Number(i.price))}</td><td>0%</td><td>${formatNaira(Number(i.price) * i.quantity)}</td></tr>`).join("")}
    </tbody>
  </table>
  <div class="summary">
    <div class="summary-inner">
      <div class="summary-row"><span class="label">Subtotal</span><span class="val">${formatNaira(subtotal)}</span></div>
      <div class="summary-row"><span class="label">Tax</span><span class="val">${formatNaira(Number(invoice.vatAmount))}</span></div>
      <div class="summary-total"><span>Total paid</span><span class="val">${formatNaira(invoice.total)}</span></div>
    </div>
  </div>
  <div class="thank-you">Thank you for your payment.</div>
  <p class="footer">Powered by InvoiceFlow · Nigeria</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": "inline; filename=receipt-" + invNumber + ".html",
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
