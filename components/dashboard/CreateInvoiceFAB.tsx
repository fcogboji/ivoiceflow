"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function CreateInvoiceFAB() {
  return (
    <Link
      href="/dashboard/invoices/new"
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center hover:bg-emerald-700 active:scale-95 z-30 md:bottom-6 md:right-6 md:w-16 md:h-16"
      aria-label="Create invoice"
    >
      <Plus className="h-7 w-7 md:h-8 md:w-8" />
    </Link>
  );
}
