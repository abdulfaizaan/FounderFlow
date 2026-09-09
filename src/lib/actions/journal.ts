"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { revalidatePath } from "next/cache";

export const JOURNAL_TYPES = [
  "IDEA",
  "DECISION",
  "LESSON",
  "WIN",
  "FAILURE",
  "CUSTOMER_INSIGHT",
] as const;

export type JournalType = (typeof JOURNAL_TYPES)[number];

export async function createJournalEntry(data: {
  type: JournalType;
  content: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  if (!JOURNAL_TYPES.includes(data.type)) throw new Error("Invalid type");

  const entry = await prisma.journalEntry.create({
    data: {
      startupId: ctx.startupId,
      type: data.type,
      content: data.content.trim(),
    },
  });

  revalidatePath("/journal");
  return entry;
}

export async function deleteJournalEntry(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  await prisma.journalEntry.deleteMany({
    where: { id, startupId: ctx.startupId },
  });

  revalidatePath("/journal");
}

export async function getJournalEntries() {
  const { userId } = await auth();
  if (!userId) return [];

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) return [];

  return prisma.journalEntry.findMany({
    where: { startupId: ctx.startupId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}