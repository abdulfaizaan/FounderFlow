"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function listStartups() {
  const { userId } = await auth();
  if (!userId) return [];

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
    include: {
      startups: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, stage: true, isPrimary: true },
      },
    },
  });

  return founder?.startups ?? [];
}

export async function createStartup(data: {
  name: string;
  stage: string;
  targetCustomer?: string;
  goalTitle?: string;
  targetDate?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
  });
  if (!founder) throw new Error("No founder found");

  const startup = await prisma.$transaction(async (tx) => {
    const created = await tx.startup.create({
      data: {
        founderId: founder.id,
        name: data.name,
        stage: data.stage,
        targetCustomer: data.targetCustomer || null,
        isPrimary: false,
      },
    });

    if (data.goalTitle && data.goalTitle.trim() !== "") {
      await tx.goal.create({
        data: {
          startupId: created.id,
          title: data.goalTitle,
          targetDate: data.targetDate ? new Date(data.targetDate) : null,
          status: "active",
          isActive: true,
        },
      });
    }

    return created;
  });

  await prisma.founder.update({
    where: { id: founder.id },
    data: { activeStartupId: startup.id },
  });

  revalidatePath("/today");
  revalidatePath("/review");
  return startup;
}

export async function switchStartup(startupId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
    include: { startups: { select: { id: true } } },
  });
  if (!founder) throw new Error("No founder found");

  const owned = founder.startups.some((s) => s.id === startupId);
  if (!owned) throw new Error("Startup not found");

  await prisma.founder.update({
    where: { id: founder.id },
    data: { activeStartupId: startupId },
  });

  revalidatePath("/today");
  revalidatePath("/review");
}