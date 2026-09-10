import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rankTasks, getRecommendation } from "@/lib/recommendation";
import { getActiveStartup, getAvailableMinutes, getFounderPreferenceMilestoneIds } from "@/lib/startup-context";
import { track } from "@/lib/analytics";
import { getCopilotUsage } from "@/lib/usage";
import { GoalBanner } from "@/components/dashboard/goal-banner";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { ContextGap, type ContextGap as ContextGapType } from "@/components/dashboard/context-gap";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { WeekSummary } from "@/components/dashboard/week-summary";
import { StandupForm } from "@/components/dashboard/standup-form";
import { EvidenceForm } from "@/components/dashboard/evidence-form";
import { RevenueEvidenceForm } from "@/components/dashboard/revenue-evidence-form";
import { CopilotChat } from "@/components/dashboard/copilot-chat";
import { FeedbackCard } from "@/components/dashboard/feedback-card";
import { AIScheduleProposer } from "@/components/dashboard/ai-schedule-proposer";

export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ startup?: string }>;
}) {
  const { startup: startupParam } = await searchParams;
  const { founder, startup } = await getActiveStartup(startupParam);

  const availableMinutes = getAvailableMinutes(founder);

  const goal = startup.goals[0] ?? null;
  const todayStandup = await prisma.standup.findFirst({
    where: {
      startupId: startup.id,
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  });

  const [openBlockers, recentEvidence, dismissedRecs, copilotMessages, todayTasks] =
    await Promise.all([
      prisma.blocker.findMany({
        where: { startupId: startup.id, status: "OPEN" },
        select: { id: true, description: true, taskId: true },
      }),
      prisma.evidence.findMany({
        where: {
          startupId: startup.id,
          recordedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { id: true, type: true, value: true, note: true },
      }),
      prisma.recommendation.findMany({
        where: { startupId: startup.id, status: { in: ["DISMISSED", "SNOOZED"] } },
        select: { taskId: true },
      }),
      prisma.copilotMessage.findMany({
        where: { startupId: startup.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      (() => {
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        return prisma.task.findMany({
          where: {
            milestone: { goal: { startupId: startup.id, isActive: true } },
            scheduledFor: { gte: dayStart, lt: dayEnd },
            status: { not: "DONE" },
          },
          select: {
            id: true,
            title: true,
            scheduledFor: true,
            estimateMinutes: true,
            milestone: { select: { title: true } },
          },
          orderBy: { scheduledFor: "asc" },
        });
      })(),
    ]);

  const copilotHistory = copilotMessages.reverse().map((m) => ({
    role: m.role as "FOUNDER" | "AI",
    content: m.content,
  }));

  if (!goal) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Welcome, {founder.name || "Founder"}
          </h2>
          <p className="text-muted-foreground">
            No active goal yet for {startup.name}. Set one up to start getting daily recommendations.
          </p>
        </div>
        <ContextGap
          gaps={[
            {
              key: "goal",
              message: "No active goal yet. Define one to start receiving daily recommendations.",
              cta: { href: "/plan", label: "Set a goal" },
            },
          ]}
        />
      </div>
    );
  }

  const allTasks = goal.milestones.flatMap((m) => m.tasks);
  const openBlockerTaskIds = openBlockers
    .filter((b) => b.taskId)
    .map((b) => b.taskId!);

  const eligibleTasks = allTasks.filter((t) =>
    ["TODO", "IN_PROGRESS"].includes(t.status)
  );
  const wh = await prisma.founder.findUnique({
    where: { id: founder.id },
    select: { workingHours: true },
  });
  const whObject = wh?.workingHours as { hoursPerDay?: number } | null;
  const gaps: ContextGapType[] = [];
  if (goal.milestones.length === 0) {
    gaps.push({
      key: "milestones",
      message: "You have a goal but no milestones. Break it into milestones to get recommendations.",
      cta: { href: "/plan", label: "Add milestone" },
    });
  } else if (eligibleTasks.length === 0) {
    gaps.push({
      key: "tasks",
      message: "No actionable tasks yet. Add tasks to a milestone.",
      cta: { href: "/plan", label: "Add tasks" },
    });
  }
  if (!whObject?.hoursPerDay) {
    gaps.push({
      key: "hours",
      message: "You haven't set your available hours per day. Recommendations need this to size your plan.",
      cta: { href: "/settings", label: "Set hours" },
    });
  }

  const scored = rankTasks(allTasks, {
    goalId: goal.id,
    availableMinutes,
    openBlockerTaskIds,
    recentEvidenceMilestoneIds: [],
    taskIdsToSnooze: dismissedRecs
      .map((r) => r.taskId)
      .filter((id): id is string => id !== null),
    founderPreferenceMilestoneIds: await getFounderPreferenceMilestoneIds(startup.id),
  });

  const rec = getRecommendation(scored);

  const copilotUsage = await getCopilotUsage(founder.id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const firstShown = await prisma.analyticsEvent.findFirst({
    where: { startupId: startup.id, event: "first_recommendation_shown" },
    select: { event: true },
  });
  const shownToday = await prisma.analyticsEvent.findMany({
    where: {
      startupId: startup.id,
      event: { in: ["recommendation_shown", "recommendation_shown_again"] },
      createdAt: { gte: todayStart },
    },
    select: { event: true },
  });
  const shownTodaySet = new Set(shownToday.map((e) => e.event));
  if (rec?.primary) {
    if (!firstShown) {
      await track("first_recommendation_shown", {
        founderId: founder.id,
        startupId: startup.id,
        entityId: rec.primary.taskId,
      });
    }
    if (!shownTodaySet.has("recommendation_shown")) {
      await track("recommendation_shown", {
        founderId: founder.id,
        startupId: startup.id,
        entityId: rec.primary.taskId,
      });
      if (firstShown && !shownTodaySet.has("recommendation_shown_again")) {
        await track("recommendation_shown_again", {
          founderId: founder.id,
          startupId: startup.id,
          entityId: rec.primary.taskId,
        });
      }
    }
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const tasksDoneThisWeek = await prisma.task.count({
    where: {
      milestone: { goalId: goal.id },
      status: "DONE",
      updatedAt: { gte: weekStart },
    },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <div className="animate-rise">
        <p className="text-sm font-medium text-primary">{dateStr}</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">
          Good {greeting}, {founder.name?.split(" ")[0] || "Founder"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{startup.name}</p>
      </div>

      <div className="animate-rise" style={{ animationDelay: "60ms" }}>
        <GoalBanner
          goal={{
            id: goal.id,
            title: goal.title,
            targetDate: goal.targetDate,
            definitionOfSuccess: goal.definitionOfSuccess,
          }}
        />
      </div>

      <div className="animate-rise" style={{ animationDelay: "90ms" }}>
        <ContextGap gaps={gaps} />
      </div>

      {rec?.primary ? (
        <section className="animate-rise" style={{ animationDelay: "120ms" }}>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Today&apos;s recommendation
          </h2>
          <RecommendationCard recommendation={rec.primary} isPrimary evidence={recentEvidence} />
          {rec.alternatives.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Alternatives
              </p>
              <div className="space-y-2">
                {rec.alternatives.map((alt) => (
                  <RecommendationCard
                    key={alt.taskId}
                    recommendation={alt}
                    isPrimary={false}
                    evidence={recentEvidence}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="animate-rise rounded-2xl border bg-card p-8 text-center" style={{ animationDelay: "120ms" }}>
          <p className="text-muted-foreground">
            All tasks done! Great work today.
          </p>
        </div>
      )}

      <div className="animate-rise" style={{ animationDelay: "220ms" }}>
        <FeedbackCard hasRecommendation={!!rec?.primary} />
      </div>

      <div className="animate-rise" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Today&apos;s schedule
          </h2>
          <AIScheduleProposer />
        </div>
        <TodaySchedule
          tasks={todayTasks.filter((t): t is typeof t & { scheduledFor: Date } => !!t.scheduledFor)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3 animate-rise" style={{ animationDelay: "360ms" }}>
        {todayStandup ? (
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <h3 className="text-sm font-semibold">Today&apos;s Focus</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Focus</p>
                <p className="text-sm">{todayStandup.today || "No focus set for today."}</p>
              </div>
              {todayStandup.blockers && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Blockers</p>
                  <p className="text-sm text-destructive">{todayStandup.blockers}</p>
                </div>
              )}
              <div className="pt-2">
                <StandupForm existingStandup={todayStandup} />
              </div>
            </div>
          </div>
        ) : (
          <StandupForm existingStandup={todayStandup} />
        )}
        <EvidenceForm />
        <RevenueEvidenceForm />
      </div>

      <section className="animate-rise" style={{ animationDelay: "420ms" }}>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Your AI copilot
        </h2>
        <CopilotChat history={copilotHistory} usage={copilotUsage} />
      </section>

      <div className="animate-rise" style={{ animationDelay: "480ms" }}>
        <WeekSummary
          tasksDone={tasksDoneThisWeek}
          tasksTotal={allTasks.length}
          evidenceCount={recentEvidence.length}
          blockers={openBlockers.map((b) => ({
            id: b.id,
            description: b.description,
          }))}
          availableMinutes={availableMinutes}
        />
      </div>
    </div>
  );
}