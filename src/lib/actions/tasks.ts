"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { track } from "@/lib/analytics";
import { revalidatePath } from "next/cache";

async function findOwnedTask(taskId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      milestone: { goal: { startupId: ctx.startupId } },
    },
  });

  return { task, ctx };
}

export async function scheduleTask(taskId: string, scheduledFor: string) {
  const { task: owned, ctx } = await findOwnedTask(taskId);
  if (!owned) throw new Error("Task not found");

  const when = new Date(scheduledFor);
  if (isNaN(when.getTime())) throw new Error("Invalid date");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { scheduledFor: when },
  });

  await track("recommendation_scheduled", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: taskId,
  });

  revalidatePath("/today");
  return task;
}

export async function unscheduleTask(taskId: string) {
  const { task: owned, ctx } = await findOwnedTask(taskId);
  if (!owned) throw new Error("Task not found");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { scheduledFor: null },
  });

  await track("recommendation_unscheduled", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: taskId,
  });

  revalidatePath("/today");
  return task;
}

export async function createTask(data: {
  milestoneId: string;
  title: string;
  description?: string;
  estimateMinutes?: number;
  dueDate?: string;
  priority?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const task = await prisma.task.create({
    data: {
      milestoneId: data.milestoneId,
      title: data.title,
      description: data.description,
      estimateMinutes: data.estimateMinutes,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority || "MEDIUM",
      status: "TODO",
    },
  });

  await track("task_created", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: task.id,
  });

  revalidatePath("/today");
  revalidatePath("/plan");
  return task;
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    estimateMinutes?: number;
    dueDate?: string;
    priority?: string;
  }
) {
  const { task: owned, ctx } = await findOwnedTask(id);
  if (!owned) throw new Error("Task not found");

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });  });

  if (data.status === "IN_PROGRESS") {
    await track("recommendation_started", {
      founderId: ctx.founder.id,
      startupId: ctx.startupId,
      entityId: id,
    });
  }

  revalidatePath("/today");
  revalidatePath("/plan");
  return task;
}

export async function completeTask(id: string) {
  const { task: owned, ctx } = await findOwnedTask(id);
  if (!owned) throw new Error("Task not found");

  const task = await prisma.task.update({
    where: { id },
    data: { status: "DONE" },
  });

  await track("recommendation_completed", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: id,
  });

  revalidatePath("/today");
  return task;
}

export async function snoozeTask(id: string, days: number = 1) {
  const { task: owned, ctx } = await findOwnedTask(id);
  if (!owned) throw new Error("Task not found");

  const newDate = new Date();
  newDate.setDate(newDate.getDate() + days);
  newDate.setHours(0, 0, 0, 0);

  const task = await prisma.task.update({
    where: { id },
    data: {
      dueDate: newDate,
      scheduledFor: null, // Clear schedule if snoozed to force rescheduling
    },
  });

  revalidatePath("/today");
  revalidatePath("/plan");
  return task;
}

export async function deleteTask(id: string) {

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/today");
}