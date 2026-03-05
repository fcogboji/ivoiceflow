"use client";

import { MessageCircle } from "lucide-react";
import {
  fillWhatsAppTemplate,
  getDefaultWhatsAppTemplate,
  formatNaira,
  whatsAppShareUrl,
} from "@/lib/utils";

type Props = {
  customerName: string;
  customerPhone: string | null;
  amount: string;
  invoiceLink: string;
  customTemplate?: string | null;
  label?: string;
  className?: string;
};

export function WhatsAppShareButton({
  customerName,
  customerPhone,
  amount,
  invoiceLink,
  customTemplate,
  label = "Send via WhatsApp",
  className = "",
}: Props) {
  const template = customTemplate || getDefaultWhatsAppTemplate();
  const message = fillWhatsAppTemplate(template, {
    customerName,
    amount,
    invoiceLink,
  });

  const href = customerPhone
    ? whatsAppShareUrl(customerPhone, message)
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white px-4 py-3 font-medium hover:bg-[#20BD5A] min-h-[48px] ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </a>
  );
}
