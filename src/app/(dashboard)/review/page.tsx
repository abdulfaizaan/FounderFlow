import { prisma } from "@/lib/prisma";
import { getActiveStartup } from "@/lib/startup-context";
import { WeeklyReview } from "@/components/dashboard/weekly-review";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ startup?: string }>;
}) {
  const { startup: startupParam } = await searchParams;
  const { startup } = await getActiveStartup(startupParam);

  const [review, milestones] = await Promise.all([
    prisma.weeklyReview.findFirst({
      where: { startupId: startup.id },
      orderBy: { weekStart: "desc" },
    }),
    prisma.milestone.findMany({
      where: { goal: { startupId: startup.id, isActive: true } },
      select: { id: true, title: true },
      orderBy: { sortOrder: "asc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Review</h1>
        <p className="text-muted-foreground mt-1">
          {startup.name} — your AI-generated summary of the week.
        </p>
      </Reveal>

      <WeeklyReview
        review={review ? {
          completedSummary: review.completedSummary,
          createdAt: review.createdAt,
        } : null}
        milestones={milestones}
      />
    </div>
  );
}