"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { track } from "@/lib/analytics";
import { revalidatePath } from "next/cache";

export async function createMilestone(data: {
  goalId: string;
  title: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const goal = await prisma.goal.findFirst({
    where: { id: data.goalId, startupId: ctx.startupId },
    select: { id: true },
  });
  if (!goal) throw new Error("Goal not found");

  const maxOrder = await prisma.milestone.aggregate({
    where: { goalId: data.goalId },
    _max: { sortOrder: true },
  });

  const milestone = await prisma.milestone.create({
    data: {
      goalId: data.goalId,
      title: data.title,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await track("milestone_created", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: milestone.id,
  });

  revalidatePath("/today");
  revalidatePath("/plan");
  return milestone;
}

export async function updateMilestone(
  id: string,
  data: { title?: string; status?: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const milestone = await prisma.milestone.update({
    where: { id },
    data,
  });

  revalidatePath("/today");
  return milestone;
}

export async function checkMilestoneCompletion(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { tasks: true },
  });

  if (!milestone) throw new Error("Milestone not found");

  const allDone = milestone.tasks.every((t) => t.status === "DONE");
  if (allDone && milestone.status !== "completed") {
    await prisma.milestone.update({
      where: { id },
      data: { status: "completed" },
    });
    revalidatePath("/today");
  }

  return {
    allDone,
    taskCount: milestone.tasks.length,
    completedCount: milestone.tasks.filter((t) => t.status === "DONE").length,
  };
}