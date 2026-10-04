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
import { TaskManager } from "@/components/dashboard/task-manager";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { CardHelp } from "@/components/dashboard/card-help";
import { TodayHint } from "@/components/dashboard/today-hint";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ startup?: string }>;
}) {
  const { startup: startupParam } = await searchParams;
  const { founder, startup } = await getActiveStartup(startupParam);

  const goal = startup.goals[0] ?? null;

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
              cta: { href: "/onboarding", label: "Set a goal" },
            },
          ]}
        />
      </div>
    );
  }

  const availableMinutes = getAvailableMinutes(founder);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  // All reads depend only on ids known after getActiveStartup — run them in one
  // parallel round-trip instead of a serial chain (TTFB).
  const [
    todayStandup,
    openBlockers,
    recentEvidence,
    dismissedRecs,
    copilotMessages,
    todayTasks,
    wh,
    founderPreferenceMilestoneIds,
    copilotUsage,
    firstShown,
    shownToday,
    tasksDoneThisWeek,
    planGoal,
  ] = await Promise.all([
    prisma.standup.findFirst({
      where: {
        startupId: startup.id,
        date: { gte: todayStart },
      },
    }),
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
      const dayEnd = new Date(todayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      return prisma.task.findMany({
        where: {
          milestone: { goal: { startupId: startup.id, isActive: true } },
          scheduledFor: { gte: todayStart, lt: dayEnd },
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
    prisma.founder.findUnique({
      where: { id: founder.id },
      select: { workingHours: true },
    }),
    getFounderPreferenceMilestoneIds(startup.id),
    getCopilotUsage(founder.id),
    prisma.analyticsEvent.findFirst({
      where: { startupId: startup.id, event: "first_recommendation_shown" },
      select: { event: true },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        startupId: startup.id,
        event: { in: ["recommendation_shown", "recommendation_shown_again"] },
        createdAt: { gte: todayStart },
      },
      select: { event: true },
    }),
    prisma.task.count({
      where: {
        milestone: { goalId: goal.id },
        status: "DONE",
        updatedAt: { gte: weekStart },
      },
    }),
    prisma.goal.findFirst({
      where: { startupId: startup.id, isActive: true },
      include: {
        milestones: {
          orderBy: { sortOrder: "asc" },
          include: {
            tasks: {
              orderBy: { createdAt: "asc" },
              where: { status: { not: "ARCHIVED" } },
            },
          },
        },
      },
    }),
  ]);

  const copilotHistory = copilotMessages.reverse().map((m) => ({
    role: m.role as "FOUNDER" | "AI",
    content: m.content,
  }));

  const allTasks = goal.milestones.flatMap((m) => m.tasks);
  const openBlockerTaskIds = openBlockers
    .filter((b) => b.taskId)
    .map((b) => b.taskId!);

  const eligibleTasks = allTasks.filter((t) =>
    ["TODO", "IN_PROGRESS"].includes(t.status)
  );
  const whObject = wh?.workingHours as { hoursPerDay?: number } | null;
  const gaps: ContextGapType[] = [];
  if (goal.milestones.length === 0) {
    gaps.push({
      key: "milestones",
      message: "You have a goal but no milestones. Break it into milestones to get recommendations.",
      cta: { href: "/today", label: "Add milestone" },
    });
  } else if (eligibleTasks.length === 0) {
    gaps.push({
      key: "tasks",
      message: "No actionable tasks yet. Add tasks to a milestone.",
      cta: { href: "/today", label: "Add tasks" },
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
    founderPreferenceMilestoneIds,
  });

  const rec = getRecommendation(scored);

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Reveal>
        <p className="text-sm font-medium text-primary">{dateStr}</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">
          Good {greeting}, {founder.name?.split(" ")[0] || "Founder"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{startup.name}</p>
      </Reveal>

      <TodayHint />

      <GoalBanner
        goal={{
          id: goal.id,
          title: goal.title,
          targetDate: goal.targetDate,
          definitionOfSuccess: goal.definitionOfSuccess,
        }}
      />

      <ContextGap gaps={gaps} />

      {rec?.primary ? (
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today&apos;s recommendation
            </h2>
            <CardHelp title="Today&apos;s recommendation">
              The single task our ranking engine thinks you should do next, given your goal,
              available time, open blockers, and recent evidence. Alternatives below are the
              next-best picks — mark one Helpful or Not helpful to teach your preferences.
            </CardHelp>
          </div>
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
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            All tasks done! Great work today.
          </p>
        </div>
      )}

      <FeedbackCard hasRecommendation={!!rec?.primary} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today&apos;s schedule
            </h2>
            <CardHelp title="Today&apos;s schedule">
              Tasks you&apos;ve scheduled for today, in time order. Use the ✦ AI proposer to
              have your open tasks slotted into available time automatically.
            </CardHelp>
          </div>
          <AIScheduleProposer />
        </div>
        <TodaySchedule
          tasks={todayTasks.filter((t): t is typeof t & { scheduledFor: Date } => !!t.scheduledFor)}
        />
      </div>

      <CollapsibleSection
        title="Beyond today"
        description="Plan tasks, log progress, and review the week."
        defaultOpen={gaps.some((g) => g.key === "milestones" || g.key === "tasks")}
      >
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Plan
              </h2>
              <CardHelp title="Plan">
                Your active goal broken into milestones and tasks — the same content that used
                to live on its own page, now folded into Today. Add, edit, and complete tasks
                here; everything rolls up into your recommendations.
              </CardHelp>
            </div>
            {planGoal ? (
              <TaskManager
                goal={{ id: planGoal.id, title: planGoal.title }}
                milestones={planGoal.milestones.map((m) => ({
                  id: m.id,
                  title: m.title,
                  status: m.status,
                  tasks: m.tasks.map((t) => ({
                    id: t.id,
                    title: t.title,
                    status: t.status,
                    priority: t.priority,
                    estimateMinutes: t.estimateMinutes,
                    dueDate: t.dueDate,
                  })),
                }))}
              />
            ) : (
              <div className="rounded-xl border bg-card p-12 text-center space-y-4">
                <p className="text-muted-foreground">
                  No active goal yet. Set one up during onboarding.
                </p>
                <Button size="sm" variant="outline" render={<Link href="/onboarding" />}>
                  Set up your goal
                </Button>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Daily check-in
              </h2>
              <CardHelp title="Daily check-in">
                Log your focus for today, record product or customer evidence, and log revenue
                signals. Evidence feeds the recommendation engine and your weekly summary.
              </CardHelp>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {todayStandup ? (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-primary" />
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
          </section>

          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your AI copilot
              </h2>
              <CardHelp title="Your AI copilot">
                Ask anything about your plan, blockers, or recent progress. Usage is metered by
                your billing plan.
              </CardHelp>
            </div>
            <CopilotChat history={copilotHistory} usage={copilotUsage} />
          </section>

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
      </CollapsibleSection>
    </div>
  );
}