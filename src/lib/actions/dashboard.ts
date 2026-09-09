"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser, getAvailableMinutes, getFounderPreferenceMilestoneIds } from "@/lib/startup-context";
import { rankTasks, getRecommendation } from "@/lib/recommendation";
import { track } from "@/lib/analytics";
import { revalidatePath } from "next/cache";

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) return null;

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return null;

  const startup = await prisma.startup.findUnique({
    where: { id: ctx.startupId },
    include: {
      goals: {
        where: { isActive: true },
        include: {
          milestones: {
            include: {
              tasks: {
                where: { status: { notIn: ["ARCHIVED", "DONE"] } },
                include: {
                  milestone: { include: { goal: true } },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        take: 1,
      },
      blockers: { where: { status: "OPEN" }, select: { id: true, description: true, taskId: true } },
      evidence: {
        where: { recordedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { id: true, type: true, value: true, note: true, recordedAt: true },
      },
      recommendations: { where: { status: { in: ["DISMISSED", "SNOOZED"] } }, select: { taskId: true } },
    },
  });

  if (!startup) return null;

  const founder = ctx.founder;
  const goal = startup.goals[0] ?? null;
  const availableMinutes = getAvailableMinutes(founder);

  if (!goal) {
    return {
      founder: { name: founder.name, timezone: founder.timezone },
      startup: { name: startup.name },
      goal: null,
      recommendation: null,
      alternatives: [],
      weekStats: { tasksDone: 0, tasksTotal: 0, evidenceCount: startup.evidence.length },
      blockers: [],
      availableTime: 0,
    };
  }

  const allTasks = goal.milestones.flatMap((m) => m.tasks);
  const openBlockerTaskIds = startup.blockers.filter((b) => b.taskId).map((b) => b.taskId!);

  const scored = rankTasks(allTasks, {
    goalId: goal.id,
    availableMinutes,
    openBlockerTaskIds,
    recentEvidenceMilestoneIds: [],
    taskIdsToSnooze: startup.recommendations.map((r) => r.taskId).filter((id): id is string => id !== null),
    founderPreferenceMilestoneIds: await getFounderPreferenceMilestoneIds(startup.id),
  });

  const rec = getRecommendation(scored);

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

  return {
    founder: { name: founder.name, timezone: founder.timezone },
    startup: { name: startup.name },
    goal: { id: goal.id, title: goal.title, targetDate: goal.targetDate, definitionOfSuccess: goal.definitionOfSuccess },
    recommendation: rec?.primary ?? null,
    alternatives: rec?.alternatives ?? [],
    weekStats: { tasksDone: tasksDoneThisWeek, tasksTotal: allTasks.length, evidenceCount: startup.evidence.length },
    blockers: startup.blockers.map((b) => ({ id: b.id, description: b.description })),
    availableTime: availableMinutes,
  };
}

export async function dismissRecommendation(taskId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  await prisma.recommendation.create({
    data: {
      startupId: ctx.startupId,
      taskId,
      actionText: "Dismissed",
      rationale: "User dismissed",
      confidence: 0,
      status: "DISMISSED",
    },
  });

  await track("recommendation_dismissed", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: taskId,
  });
  revalidatePath("/today");
}

export async function snoozeRecommendation(taskId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const exists = await prisma.recommendation.findFirst({
    where: { startupId: ctx.startupId, taskId, status: "SNOOZED" },
  });
  if (!exists) {
    await prisma.recommendation.create({
      data: {
        startupId: ctx.startupId,
        taskId,
        actionText: "Snoozed",
        rationale: "User snoozed",
        confidence: 0,
        status: "SNOOZED",
      },
    });
  }

  await track("recommendation_snoozed", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: taskId,
  });
  revalidatePath("/today");
}

export async function recordRecommendationFeedback(feedback: "HELPFUL" | "NOT_HELPFUL") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return { success: false };

  await prisma.recommendation.updateMany({
    where: { startupId: ctx.startupId, feedback: null },
    data: { feedback },
  });

  await track("recommendation_feedback", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    meta: { feedback },
  });
  revalidatePath("/today");
  return { success: true };
}
