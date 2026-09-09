"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLeads(startupId: string) {
  return await prisma.lead.findMany({
    where: { startupId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLead(data: { name: string; email: string; status: string; notes?: string }, startupId: string) {
  const lead = await prisma.lead.create({
    data: {
      ...data,
      startupId,
    },
  });
  revalidatePath("/crm");
  return lead;
}

export async function updateLead(id: string, data: Partial<{ name: string; email: string; status: string; notes?: string }>) {
  const lead = await prisma.lead.update({
    where: { id },
    data,
  });
  revalidatePath("/crm");
  return lead;
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/crm");
  return { success: true };
}

export async function updateLeadStatus(id: string, status: string) {
  await prisma.lead.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/crm");
  return { success: true };
}
