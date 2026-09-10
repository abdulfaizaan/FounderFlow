import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { getLeads } from "@/lib/actions/crm";
import { CRMView } from "@/components/dashboard/crm-view";
import { redirect } from "next/navigation";

export default async function CRMPage() {
  const { userId } = await (await import("@clerk/nextjs/server")).auth();
  if (!userId) redirect("/sign-in");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) redirect("/onboarding");

  const initialLeads = await getLeads(ctx.startupId);

  return <CRMView initialLeads={initialLeads} startupId={ctx.startupId} />;
}
