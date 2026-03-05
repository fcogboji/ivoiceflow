"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Users, Settings, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/quotes", label: "Quotes", icon: Quote },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 border-t border-slate-200 bg-white flex justify-around items-center safe-area-pb z-40 md:relative md:border-0 md:bg-transparent md:flex md:gap-2 md:justify-start md:pt-4 md:pb-2 md:px-4"
      aria-label="Main navigation"
    >
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg min-w-[64px] min-h-[44px] md:flex-row md:min-w-0 md:px-3",
              active
                ? "text-emerald-600 bg-emerald-50"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className="h-6 w-6 md:h-5 md:w-5" />
            <span className="text-xs font-medium md:text-sm">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
