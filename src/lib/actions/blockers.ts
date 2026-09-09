"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { revalidatePath } from "next/cache";

export async function resolveBlocker(blockerId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const blocker = await prisma.blocker.findUnique({
    where: { id: blockerId },
  });

  if (!blocker || blocker.startupId !== ctx.startupId) {
    throw new Error("Blocker not found or unauthorized");
  }

  await prisma.blocker.update({
    where: { id: blockerId },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  revalidatePath("/today");
}

export async function dismissBlocker(blockerId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const blocker = await prisma.blocker.findUnique({
    where: { id: blockerId },
  });

  if (!blocker || blocker.startupId !== ctx.startupId) {
    throw new Error("Blocker not found or unauthorized");
  }

  await prisma.blocker.update({
    where: { id: blockerId },
    data: { status: "DISMISSED" },
  });

  revalidatePath("/today");
}
