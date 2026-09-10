import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { getWikiStructure } from "@/lib/actions/wiki";
import { WikiView } from "@/components/dashboard/wiki-view";
import { redirect } from "next/navigation";

export default async function WikiPage() {
  const { userId } = await (await import("@clerk/nextjs/server")).auth();
  if (!userId) redirect("/sign-in");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) redirect("/onboarding");

  const initialStructure = await getWikiStructure(ctx.startupId);

  return <WikiView initialStructure={initialStructure} startupId={ctx.startupId} />;
}
