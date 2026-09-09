import { prisma } from "@/lib/prisma";
import { getActiveStartup } from "@/lib/startup-context";
import { WeeklyReview } from "@/components/dashboard/weekly-review";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ startup?: string }>;
}) {
  const { startup: startupParam } = await searchParams;
  const { startup } = await getActiveStartup(startupParam);

  const review = await prisma.weeklyReview.findFirst({
    where: { startupId: startup.id },
    orderBy: { weekStart: "desc" },
  });

  const milestones = await prisma.milestone.findMany({
    where: { goal: { startupId: startup.id, isActive: true } },
    select: { id: true, title: true },
    orderBy: { sortOrder: "asc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Review</h1>
        <p className="text-muted-foreground mt-1">
          {startup.name} — your AI-generated summary of the week.
        </p>
      </div>

      <WeeklyReview
        review={review ? {
          completedSummary: review.completedSummary,
          recommendedFocus: review.recommendedFocus,
          createdAt: review.createdAt,
        } : null}
        milestones={milestones}
      />
    </div>
  );
}