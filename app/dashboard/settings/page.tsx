import { getCurrentUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { ProductsSection } from "@/components/settings/ProductsSection";
import { LinkedBankAccountsSection } from "@/components/settings/LinkedBankAccountsSection";
import { BankTransferWebhookSection } from "@/components/settings/BankTransferWebhookSection";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Settings</h1>
      <SettingsForm user={user} />
      <LinkedBankAccountsSection />
      <BankTransferWebhookSection webhookUrl={baseUrl} />
      <ProductsSection />
    </div>
  );
}
