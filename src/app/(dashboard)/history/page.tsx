import { prisma } from "@/lib/prisma";
import { getActiveStartup } from "@/lib/startup-context";
import { HistoryView } from "@/components/dashboard/history-view";
import { HISTORY_WEEKS, buildBuckets, bucketIndexFor, weekStart } from "@/lib/progress-history";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ startup?: string }>;
}) {
  const { startup: startupParam } = await searchParams;
  const { startup } = await getActiveStartup(startupParam);

  const { buckets, firstStart } = buildBuckets();

  const [doneTasks, allEvidence] = await Promise.all([
    prisma.task.findMany({
      where: {
        status: "DONE",
        updatedAt: { gte: firstStart },
        milestone: { goal: { startupId: startup.id } },
      },
      select: { updatedAt: true },
    }),
    prisma.evidence.findMany({
      where: { startupId: startup.id, recordedAt: { gte: firstStart } },
      select: { recordedAt: true, type: true, value: true },
    }),
  ]);

  for (const t of doneTasks) {
    const i = bucketIndexFor(weekStart(t.updatedAt), firstStart);
    if (i >= 0 && i < HISTORY_WEEKS) buckets[i].tasksDone += 1;
  }
  for (const e of allEvidence) {
    const i = bucketIndexFor(weekStart(e.recordedAt), firstStart);
    if (i >= 0 && i < HISTORY_WEEKS) {
      buckets[i].evidence += 1;
      if (e.type === "revenue") buckets[i].revenue += e.value ?? 0;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-1">
          {startup.name} — your last {HISTORY_WEEKS} weeks of progress.
        </p>
      </div>
      <HistoryView weeks={buckets} />
    </div>
  );
}