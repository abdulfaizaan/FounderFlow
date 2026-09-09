"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { track } from "@/lib/analytics";
import { revalidatePath } from "next/cache";

interface OnboardingData {
  name: string;
  timezone: string;
  availableHoursPerDay: number;
  startupName: string;
  stage: string;
  targetCustomer: string;
  goalTitle: string;
  targetDate: string;
  definitionOfSuccess: string;
  milestoneTitle: string;
  tasks: { title: string; estimateMinutes: number }[];
}

export async function completeOnboarding(data: OnboardingData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
  });

  // Auto-create founder if not exists
  if (!founder) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    founder = await prisma.founder.create({
      data: {
        clerkId: userId,
        name: data.name || "",
        email: user.emailAddresses[0]?.emailAddress || "",
      },
    });
  }

  const existingStartup = await prisma.startup.findFirst({
    where: { founderId: founder.id },
    select: { id: true },
  });
  if (existingStartup) {
    return { success: true, redirect: "/today" };
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.founder.update({
      where: { id: founder.id },
      data: {
        name: data.name,
        timezone: data.timezone,
        workingHours: { hoursPerDay: data.availableHoursPerDay ?? 8 },
      },
    });

    const startup = await tx.startup.create({
      data: {
        founderId: founder.id,
        name: data.startupName,
        stage: data.stage,
        targetCustomer: data.targetCustomer,
        isPrimary: true,
      },
    });

    await tx.founder.update({
      where: { id: founder.id },
      data: { activeStartupId: startup.id },
    });

    const goal = await tx.goal.create({
      data: {
        startupId: startup.id,
        title: data.goalTitle,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        definitionOfSuccess: data.definitionOfSuccess,
        status: "active",
        isActive: true,
      },
    });

    const milestone = await tx.milestone.create({
      data: {
        goalId: goal.id,
        title: data.milestoneTitle,
        status: "pending",
        sortOrder: 0,
      },
    });

    const validTasks = data.tasks.filter((t) => t.title.trim() !== "");
    let taskIds: string[] = [];
    if (validTasks.length > 0) {
      const created = await tx.task.createManyAndReturn({
        data: validTasks.map((task) => ({
          milestoneId: milestone.id,
          title: task.title,
          status: "TODO",
          estimateMinutes: task.estimateMinutes,
        })),
      });
      taskIds = created.map((t) => t.id);
    }

    return { startupId: startup.id, goalId: goal.id, milestoneId: milestone.id, taskIds };
  });

  await track("startup_created", {
    founderId: founder.id,
    startupId: result.startupId,
    entityId: result.startupId,
  });
  await track("goal_created", {
    founderId: founder.id,
    startupId: result.startupId,
    entityId: result.goalId,
  });
  await track("milestone_created", {
    founderId: founder.id,
    startupId: result.startupId,
    entityId: result.milestoneId,
  });
  for (const taskId of result.taskIds) {
    await track("task_created", { founderId: founder.id, startupId: result.startupId, entityId: taskId });
  }
  await track("onboarding_completed", { founderId: founder.id, startupId: result.startupId });

  revalidatePath("/today");
  revalidatePath("/onboarding");
  return { success: true, startupId: result.startupId };
}

export async function trackOnboardingEvent(
  event: "signup_started" | "onboarding_step_completed",
  step?: number
) {
  const { userId } = await auth();
  if (!userId) return;
  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!founder) return;
  await track(event, {
    founderId: founder.id,
    meta: step !== undefined ? { step } : undefined,
  });
}

export async function getOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) return { completed: false };

  let founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
    include: {
      startups: {
        select: { id: true },
        take: 1,
      },
    },
  });

  // Auto-create founder record if it doesn't exist yet
  if (!founder) {
    founder = await prisma.founder.create({
      data: {
        clerkId: userId,
        name: "",
        email: "",
      },
      include: {
        startups: {
          select: { id: true },
          take: 1,
        },
      },
    });
  }

  return { completed: founder.startups.length > 0 };
}