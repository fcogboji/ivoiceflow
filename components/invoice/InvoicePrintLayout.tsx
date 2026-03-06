"use client";

import { formatNaira } from "@/lib/utils";

const DEFAULT_BRAND = "#1e3a5f";
const DEFAULT_BRAND_LIGHT = "#3b82b6";

function useBrandColors(brandColor?: string | null) {
  const valid = brandColor && /^#[0-9A-Fa-f]{6}$/.test(brandColor);
  return {
    primary: valid ? brandColor! : DEFAULT_BRAND,
    secondary: valid ? brandColor! : DEFAULT_BRAND_LIGHT,
  };
}

type Item = {
  productName: string;
  quantity: number;
  price: number | bigint;
};

type Business = {
  businessName: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  phone?: string | null;
  email?: string | null;
};

type Customer = {
  name: string;
  phone?: string | null;
  email?: string | null;
};

type Props = {
  type: "invoice" | "quote";
  number: string;
  issuedDate: string;
  dueLabel?: string; // "Due Upon Receipt" or "Valid until 31/12/2025"
  business: Business;
  customer: Customer;
  items: Item[];
  subtotal: number | bigint;
  vatAmount: number | bigint;
  total: number | bigint;
  paymentLink?: string | null;
  note?: string | null;
  status?: string;
  sellerSignatureData?: string | null;
};

export function InvoicePrintLayout({
  type,
  number,
  issuedDate,
  dueLabel,
  business,
  customer,
  items,
  subtotal,
  vatAmount,
  total,
  paymentLink,
  note,
  status,
  sellerSignatureData,
}: Props) {
  const { primary, secondary } = useBrandColors(business.brandColor);
  const subtotalNum = Number(subtotal);
  const vatNum = Number(vatAmount);
  const totalNum = Number(total);
  const qrUrl = paymentLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(paymentLink)}`
    : null;

  return (
    <div className="bg-white text-slate-800 shadow-lg max-w-4xl mx-auto overflow-hidden print:shadow-none">
      {/* Top decorative bar */}
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 50%, ${primary} 100%)`,
        }}
      />

      <div className="px-6 md:px-10 pt-6 pb-8">
        {/* Header: business left, title right */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt=""
                className="h-20 w-auto max-w-[200px] object-contain mb-2"
              />
            ) : null}
            <h1
              className="text-xl md:text-2xl font-bold uppercase tracking-tight"
              style={{ color: primary }}
            >
              {business.businessName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="h-px flex-1 max-w-[120px]"
                style={{ backgroundColor: secondary }}
              />
              <svg className="w-4 h-4" style={{ color: secondary }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
              </svg>
              <div
                className="h-px flex-1 max-w-[120px]"
                style={{ backgroundColor: secondary }}
              />
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-2xl md:text-3xl font-bold uppercase"
              style={{ color: primary }}
            >
              {type === "invoice" ? "Invoice" : "Quote"}
            </p>
            <p className="text-sm mt-1" style={{ color: secondary }}>
              #{number}
            </p>
            {dueLabel && <p className="text-slate-700 mt-1 text-sm">{dueLabel}</p>}
            <p className="text-slate-600 text-sm mt-0.5">Issued {issuedDate}</p>
            {status && type === "invoice" && (
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {status}
              </span>
            )}
            {status && type === "quote" && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {status}
              </span>
            )}
          </div>
        </div>

        {/* Bill from / Bill to */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="font-bold text-slate-600 text-sm uppercase tracking-wide mb-2">
              Bill from
            </p>
            <p className="font-semibold text-slate-800">{business.businessName}</p>
            {business.phone && <p className="text-slate-600 text-sm">{business.phone}</p>}
            {business.email && <p className="text-slate-600 text-sm">{business.email}</p>}
          </div>
          <div>
            <p className="font-bold text-slate-600 text-sm uppercase tracking-wide mb-2">
              Bill to
            </p>
            <p className="font-semibold text-slate-800">{customer.name}</p>
            {customer.phone && <p className="text-slate-600 text-sm">{customer.phone}</p>}
            {customer.email && <p className="text-slate-600 text-sm">{customer.email}</p>}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-white text-left"
                style={{ backgroundColor: primary }}
              >
                <th className="p-3 font-semibold">Description</th>
                <th className="p-3 font-semibold text-center w-20">QTY</th>
                <th className="p-3 font-semibold text-center w-28">Price</th>
                <th className="p-3 font-semibold text-center w-20">Tax</th>
                <th className="p-3 font-semibold text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-slate-50" : "bg-slate-100/50"}
                >
                  <td className="p-3 text-slate-800">{item.productName}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-center">{formatNaira(Number(item.price))}</td>
                  <td className="p-3 text-center">0%</td>
                  <td className="p-3 text-right font-medium">
                    {formatNaira(Number(item.price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mt-6">
          <div className="w-full max-w-[280px] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">{formatNaira(subtotalNum)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium">{formatNaira(vatNum)}</span>
            </div>
            <div
              className="flex justify-between pt-2 mt-2 border-t-2 border-slate-200"
              style={{ borderColor: secondary }}
            >
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-bold text-lg" style={{ color: primary }}>
                {formatNaira(totalNum)}
              </span>
            </div>
          </div>
        </div>

        {/* Note */}
        {note && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{note}</p>
          </div>
        )}

        {/* Payment / QR */}
        {qrUrl && paymentLink && (
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start gap-4">
            <img
              src={qrUrl}
              alt="QR code for payment"
              className="w-[140px] h-[140px] rounded border border-slate-200"
            />
            <div className="flex-1">
              <p className="text-slate-700 text-sm">
                For online payment, scan QR code or visit
              </p>
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium mt-1 block break-all hover:underline"
                style={{ color: secondary }}
              >
                {paymentLink}
              </a>
            </div>
          </div>
        )}

        {/* Authorized signature */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div>
            {sellerSignatureData ? (
              <img
                src={sellerSignatureData}
                alt="Authorized signature"
                className="h-14 w-auto max-w-[220px] object-contain object-left mb-1"
              />
            ) : (
              <div className="h-12 border-b border-slate-300 mb-1" style={{ maxWidth: "220px" }} aria-hidden />
            )}
            <p className="text-xs text-slate-500 uppercase tracking-wide">Authorized signature</p>
            <p className="text-xs text-slate-400 mt-1">{business.businessName}</p>
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-400 text-center">
          Powered by InvoiceFlow · Nigeria
        </p>
      </div>
    </div>
  );
}
