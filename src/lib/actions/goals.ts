"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { revalidatePath } from "next/cache";

export async function updateGoal(
  id: string,
  data: {
    title?: string;
    targetDate?: string | null;
    targetValue?: number | null;
    definitionOfSuccess?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const owned = await prisma.goal.findFirst({
    where: { id, startupId: ctx.startupId },
  });
  if (!owned) throw new Error("Goal not found");

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      title: data.title,
      targetDate: data.targetDate ? new Date(data.targetDate) : data.targetDate === null ? null : undefined,
      targetValue: data.targetValue,
      definitionOfSuccess: data.definitionOfSuccess,
    },
  });

  revalidatePath("/today");
  revalidatePath("/plan");
  return goal;
}