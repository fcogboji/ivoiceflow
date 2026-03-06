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
  const quote = await prisma.quote.findFirst({
    where: { id, userId: user.id },
    include: { customer: true, items: true },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quoteNumber = `QUOTE-${quote.id.slice(-6).toUpperCase()}`;
  const validUntilStr = quote.validUntil
    ? quote.validUntil.toLocaleDateString("en-NG")
    : "";
  const dueLabel = validUntilStr ? `Valid until ${validUntilStr}` : "";
  const { primary, secondary } = brandColors(user.brandColor);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Quote ${escapeHtml(quoteNumber)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 32px; color: #1e293b; }
    .top-bar { height: 8px; background: linear-gradient(90deg, ${primary} 0%, ${secondary} 50%, ${primary} 100%); margin: -24px -32px 24px -32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .header-logo { height: 72px; width: auto; max-width: 200px; object-fit: contain; margin-bottom: 8px; }
    .business-name { font-size: 1.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: ${primary}; }
    .divider { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
    .divider-line { height: 1px; width: 100px; background: ${secondary}; }
    .title-right { text-align: right; }
    .invoice-title { font-size: 1.75rem; font-weight: 700; text-transform: uppercase; color: ${primary}; }
    .invoice-num { font-size: 0.875rem; color: ${secondary}; margin-top: 4px; }
    .meta { font-size: 0.875rem; color: #475569; margin-top: 4px; }
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
    .summary-total { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 12px; border-top: 2px solid ${secondary}; font-weight: 700; font-size: 1.125rem; }
    .summary-total .val { color: ${primary}; }
    .note { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #64748b; white-space: pre-wrap; }
    .signature-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .signature-line { height: 48px; border-bottom: 1px solid #cbd5e1; margin-bottom: 4px; max-width: 220px; }
    .signature-img { height: 56px; width: auto; max-width: 220px; object-fit: contain; margin-bottom: 4px; display: block; }
    .signature-label { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .signature-name { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
    .footer { margin-top: 32px; font-size: 0.75rem; color: #94a3b8; text-align: center; }
    .status { display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; background: #f1f5f9; color: #475569; }
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
      <p class="invoice-title">Quote</p>
      <p class="invoice-num">#${escapeHtml(quoteNumber)}</p>
      ${dueLabel ? `<p class="meta">${escapeHtml(dueLabel)}</p>` : ""}
      <p class="meta">Issued ${quote.createdAt.toLocaleDateString("en-NG")}</p>
      <span class="status">${escapeHtml(quote.status)}</span>
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
      <p class="bill-name">${escapeHtml(quote.customer.name)}</p>
      ${quote.customer.phone ? `<p class="bill-detail">${escapeHtml(quote.customer.phone)}</p>` : ""}
      ${quote.customer.email ? `<p class="bill-detail">${escapeHtml(quote.customer.email)}</p>` : ""}
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th>QTY</th><th>Price</th><th>Tax</th><th>Amount</th></tr></thead>
    <tbody>
      ${quote.items.map((i) => `<tr><td>${escapeHtml(i.productName)}</td><td>${i.quantity}</td><td>${formatNaira(Number(i.price))}</td><td>0%</td><td>${formatNaira(Number(i.price) * i.quantity)}</td></tr>`).join("")}
    </tbody>
  </table>
  <div class="summary">
    <div class="summary-inner">
      <div class="summary-total"><span>Total</span><span class="val">${formatNaira(quote.total)}</span></div>
    </div>
  </div>
  ${quote.note ? `<div class="note">${escapeHtml(quote.note)}</div>` : ""}
  <div class="signature-section">
    <div>
      ${quote.sellerSignatureData ? `<img src="${quote.sellerSignatureData.replace(/"/g, "&quot;")}" alt="" class="signature-img" />` : "<div class=\"signature-line\"></div>"}
      <p class="signature-label">Authorized signature</p>
      <p class="signature-name">${escapeHtml(user.businessName)}</p>
    </div>
  </div>
  <p class="footer">Powered by InvoiceFlow · Nigeria</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": "inline; filename=quote-" + quoteNumber + ".html",
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
