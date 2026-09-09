"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { track } from "@/lib/analytics";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const StandupSchema = z.object({
  yesterday: z.string().min(1, "Yesterday's update is required"),
  today: z.string().min(1, "Today's update is required"),
  blockers: z.string().optional(),
});

export async function submitStandup(data: {
  yesterday: string;
  today: string;
  blockers: string;
}) {
  const validatedData = StandupSchema.parse(data);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const startupId = ctx.startupId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upsert: one standup per day per startup
  const standup = await prisma.standup.upsert({
    where: {
      startupId_date: { startupId, date: today },
    },
    update: {
      yesterday: validatedData.yesterday,
      today: validatedData.today,
      blockers: validatedData.blockers,
    },
    create: {
      startupId,
      date: today,
      yesterday: validatedData.yesterday,
      today: validatedData.today,
      blockers: validatedData.blockers,
    },
  });

  // Handle blockers: update existing or create new
  if (validatedData.blockers && validatedData.blockers.trim() !== "") {
    const existingBlocker = await prisma.blocker.findFirst({
      where: { sourceStandupId: standup.id },
    });

    if (existingBlocker) {
      await prisma.blocker.update({
        where: { id: existingBlocker.id },
        data: { description: validatedData.blockers },
      });
    } else {
      await prisma.blocker.create({
        data: {
          startupId,
          description: validatedData.blockers,
          status: "OPEN",
          sourceStandupId: standup.id,
        },
      });
    }
  }


  await track("standup_completed", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: standup.id,
  });

  revalidatePath("/today");
  return standup;
}

export async function getTodayStandup() {
  const { userId } = await auth();
  if (!userId) return null;

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const standup = await prisma.standup.findUnique({
    where: {
      startupId_date: {
        startupId: ctx.startupId,
        date: today,
      },
    },
  });

  return standup;
}

export async function getStandupHistory(limit = 7) {
  const { userId } = await auth();
  if (!userId) return [];

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return [];

  const standups = await prisma.standup.findMany({
    where: { startupId: ctx.startupId },
    orderBy: { date: "desc" },
    take: limit,
  });

  return standups;
}
