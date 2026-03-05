import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";

const BRAND_BLUE = "#1e3a5f";
const BRAND_BLUE_LIGHT = "#3b82b6";

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const payLink = `${baseUrl}/pay/${invoice.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(payLink)}`;
  const subtotal = Number(invoice.total) - Number(invoice.vatAmount);
  const dueLabel = invoice.dueDate
    ? `Due ${invoice.dueDate.toLocaleDateString("en-NG")}`
    : "Due Upon Receipt";
  const invNumber = invoice.paymentReference ?? invoice.id.slice(-6).toUpperCase();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${escapeHtml(invNumber)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 32px; color: #1e293b; }
    .top-bar { height: 8px; background: linear-gradient(90deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_LIGHT} 50%, ${BRAND_BLUE} 100%); margin: -24px -32px 24px -32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .header-logo { height: 72px; width: auto; max-width: 200px; object-fit: contain; margin-bottom: 8px; }
    .business-name { font-size: 1.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: ${BRAND_BLUE}; }
    .divider { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
    .divider-line { height: 1px; width: 100px; background: ${BRAND_BLUE_LIGHT}; }
    .title-right { text-align: right; }
    .invoice-title { font-size: 1.75rem; font-weight: 700; text-transform: uppercase; color: ${BRAND_BLUE}; }
    .invoice-num { font-size: 0.875rem; color: ${BRAND_BLUE_LIGHT}; margin-top: 4px; }
    .meta { font-size: 0.875rem; color: #475569; margin-top: 4px; }
    .bill-section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .bill-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    .bill-name { font-weight: 600; color: #1e293b; }
    .bill-detail { font-size: 0.875rem; color: #475569; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    thead tr { background: ${BRAND_BLUE}; color: white; }
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
    .summary-total { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 12px; border-top: 2px solid ${BRAND_BLUE_LIGHT}; font-weight: 700; font-size: 1.125rem; }
    .summary-total .val { color: ${BRAND_BLUE}; }
    .note { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #64748b; white-space: pre-wrap; }
    .payment { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; gap: 24px; align-items: flex-start; }
    .payment qr { display: block; width: 140px; height: 140px; border: 1px solid #e2e8f0; border-radius: 4px; }
    .payment-text { font-size: 0.875rem; color: #475569; }
    .payment-link { font-size: 0.875rem; font-weight: 500; color: ${BRAND_BLUE_LIGHT}; margin-top: 4px; word-break: break-all; }
    .footer { margin-top: 32px; font-size: 0.75rem; color: #94a3b8; text-align: center; }
    .status { display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status.paid { background: #d1fae5; color: #065f46; }
    .status.pending { background: #fef3c7; color: #92400e; }
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
        <span style="color:${BRAND_BLUE_LIGHT}">●</span>
        <span class="divider-line"></span>
      </div>
    </div>
    <div class="title-right">
      <p class="invoice-title">Invoice</p>
      <p class="invoice-num">#${escapeHtml(invNumber)}</p>
      <p class="meta">${escapeHtml(dueLabel)}</p>
      <p class="meta">Issued ${invoice.createdAt.toLocaleDateString("en-NG")}</p>
      <span class="status ${invoice.status}">${invoice.status}</span>
    </div>
  </div>
  <div class="bill-section">
    <div>
      <p class="bill-label">Bill from</p>
      <p class="bill-name">${escapeHtml(user.businessName)}</p>
      ${user.phone ? `<p class="bill-detail">${escapeHtml(user.phone)}</p>` : ""}
      ${user.email ? `<p class="bill-detail">${escapeHtml(user.email)}</p>` : ""}
    </div>
    <div>
      <p class="bill-label">Bill to</p>
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
      <div class="summary-total"><span>Total</span><span class="val">${formatNaira(invoice.total)}</span></div>
    </div>
  </div>
  ${invoice.note ? `<div class="note">${escapeHtml(invoice.note)}</div>` : ""}
  ${invoice.status === "pending" ? `
  <div class="payment">
    <img src="${escapeHtml(qrUrl)}" alt="QR code" width="140" height="140" class="qr" />
    <div>
      <p class="payment-text">For online payment, scan QR code or visit</p>
      <a href="${escapeHtml(payLink)}" class="payment-link">${escapeHtml(payLink)}</a>
    </div>
  </div>
  ` : ""}
  <p class="footer">Powered by InvoiceFlow · Nigeria</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": "inline; filename=invoice-" + invNumber + ".html",
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
