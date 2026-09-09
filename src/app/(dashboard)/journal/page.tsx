import { prisma } from "@/lib/prisma";
import { getActiveStartup } from "@/lib/startup-context";
import { JournalView } from "@/components/dashboard/journal-view";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ startup?: string }>;
}) {
  const { startup: startupParam } = await searchParams;
  const { startup } = await getActiveStartup(startupParam);

  const entries = await prisma.journalEntry.findMany({
    where: { startupId: startup.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
        <p className="text-muted-foreground mt-1">
          {startup.name} — capture wins, lessons, decisions, and customer insights.
        </p>
      </div>
      <JournalView entries={entries} />
    </div>
  );
}