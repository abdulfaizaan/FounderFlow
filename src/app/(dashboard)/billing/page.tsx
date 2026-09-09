import { Lock } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 px-6 py-20 text-center">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-xl font-bold">Billing is coming soon</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Subscriptions will be available after FounderFlow opens to the public.
        You'll be able to upgrade here once launch begins.
      </p>
    </div>
  );
}