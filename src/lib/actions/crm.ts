"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { revalidatePath } from "next/cache";

export async function getLeads() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  return await prisma.lead.findMany({
    where: { startupId: ctx.startupId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLead(data: { name: string; email: string; status: string; notes?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const lead = await prisma.lead.create({
    data: {
      ...data,
      startupId: ctx.startupId,
    },
  });
  revalidatePath("/crm");
  return lead;
}

export async function updateLead(id: string, data: Partial<{ name: string; email: string; status: string; notes?: string }>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const lead = await prisma.lead.update({
    where: {
      id,
      startupId: ctx.startupId
    },
    data,
  });
  revalidatePath("/crm");
  return lead;
}

export async function deleteLead(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  await prisma.lead.delete({
    where: {
      id,
      startupId: ctx.startupId
    }
  });
  revalidatePath("/crm");
  return { success: true };
}

export async function updateLeadStatus(id: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  await prisma.lead.update({
    where: {
      id,
      startupId: ctx.startupId
    },
    data: { status },
  });
  revalidatePath("/crm");
  return { success: true };
}
