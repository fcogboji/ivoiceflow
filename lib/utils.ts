import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Normalize kobo to number (handles BigInt from Prisma). */
function koboToNumber(kobo: number | bigint): number {
  return typeof kobo === "bigint" ? Number(kobo) : kobo;
}

/** Format amount in kobo to Naira string (e.g. 3500000 or 3500000n -> "₦35,000.00") */
export function formatNaira(kobo: number | bigint): string {
  const naira = koboToNumber(kobo) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

/** Format Naira without symbol for display (e.g. "35,000.00") */
export function formatNairaPlain(kobo: number | bigint): string {
  const naira = koboToNumber(kobo) / 100;
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

/** Parse Naira input to kobo (e.g. "35,000" or "35000" -> 3500000) */
export function parseNairaToKobo(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, "");
  const naira = parseFloat(cleaned) || 0;
  return Math.round(naira * 100);
}

/** VAT 7.5% in Nigeria - returns kobo (number for Prisma BigInt fields, pass BigInt() in create) */
export function vatAmount(kobo: number | bigint): number {
  return Math.round(koboToNumber(kobo) * 0.075);
}

/** Replace template placeholders for WhatsApp message */
export function fillWhatsAppTemplate(
  template: string,
  data: { customerName?: string; amount?: string; invoiceLink?: string }
): string {
  return template
    .replace(/\{\{customerName\}\}/g, data.customerName ?? "")
    .replace(/\{\{amount\}\}/g, data.amount ?? "")
    .replace(/\{\{invoiceLink\}\}/g, data.invoiceLink ?? "");
}

const DEFAULT_WHATSAPP_TEMPLATE = `Hello {{customerName}} 👋

Here is your invoice.

Amount: {{amount}}

Pay here: {{invoiceLink}}

Thank you for your business.`;

export function getDefaultWhatsAppTemplate(): string {
  return DEFAULT_WHATSAPP_TEMPLATE;
}

/** Build WhatsApp share URL with prefilled text */
export function whatsAppShareUrl(phone: string, text: string): string {
  const normalized = phone.replace(/\D/g, "").replace(/^0/, "234");
  const prefix = normalized.startsWith("234") ? "" : "234";
  const num = prefix + normalized;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
