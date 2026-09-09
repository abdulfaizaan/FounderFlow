"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { track } from "@/lib/analytics";
import { revalidatePath } from "next/cache";

export async function recordEvidence(data: {
  type: string;
  value?: number;
  note?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const evidence = await prisma.evidence.create({
    data: {
      startupId: ctx.startupId,
      type: data.type,
      value: data.value ?? null,
      note: data.note || null,
    },
  });

  await track("evidence_recorded", {
    founderId: ctx.founder.id,
    startupId: ctx.startupId,
    entityId: evidence.id,
  });

  revalidatePath("/today");
  return evidence;
}

export async function getWeeklyEvidence() {
  const { userId } = await auth();
  if (!userId) return [];

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return [];

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const evidence = await prisma.evidence.findMany({
    where: {
      startupId: ctx.startupId,
      recordedAt: { gte: weekAgo },
    },
    orderBy: { recordedAt: "desc" },
  });

  return evidence;
}
