"use client";

import { InvoicePrintLayout } from "@/components/invoice/InvoicePrintLayout";

type Item = { productName: string; quantity: number; price: number | bigint };
type Business = { businessName: string; logoUrl?: string | null; brandColor?: string | null; phone?: string | null; email?: string | null };
type Customer = { name: string; phone?: string | null; email?: string | null };

type Props = {
  number: string;
  issuedDate: string;
  validUntil?: string | null;
  business: Business;
  customer: Customer;
  items: Item[];
  total: number | bigint;
  note?: string | null;
  status?: string;
  sellerSignatureData?: string | null;
};

export function QuotePrintLayout(props: Props) {
  const totalNum = Number(props.total);
  return (
    <InvoicePrintLayout
      type="quote"
      number={props.number}
      issuedDate={props.issuedDate}
      dueLabel={props.validUntil ? `Valid until ${props.validUntil}` : undefined}
      business={props.business}
      customer={props.customer}
      items={props.items}
      subtotal={totalNum}
      vatAmount={0}
      total={props.total}
      note={props.note}
      status={props.status}
      sellerSignatureData={props.sellerSignatureData}
    />
  );
}
