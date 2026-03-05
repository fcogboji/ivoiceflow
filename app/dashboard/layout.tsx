import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CreateInvoiceFAB } from "@/components/dashboard/CreateInvoiceFAB";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { Shield } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding");

  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-6">
      {admin && (
        <div className="bg-slate-900 text-white text-center py-1.5 px-4 text-sm">
          <Link href="/admin" className="inline-flex items-center gap-1.5 hover:underline">
            <Shield className="h-4 w-4" /> App admin
          </Link>
        </div>
      )}
      <header className="sticky top-0 z-30 flex items-center justify-end h-14 px-4 bg-slate-50/95 backdrop-blur border-b border-slate-200">
        <UserMenu />
      </header>
      <div className="max-w-4xl mx-auto">{children}</div>
      <CreateInvoiceFAB />
      <DashboardNav />
    </div>
  );
}
