"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { revalidatePath } from "next/cache";

export async function getWikiStructure() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const folders = await prisma.wikiFolder.findMany({
    where: { startupId: ctx.startupId },
    orderBy: { name: "asc" },
  });
  const pages = await prisma.wikiPage.findMany({
    where: { startupId: ctx.startupId },
    orderBy: { title: "asc" },
  });

  return { folders, pages };
}

export async function createWikiFolder(data: { name: string; parentId?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const folder = await prisma.wikiFolder.create({
    data: {
      name: data.name,
      parentId: data.parentId,
      startupId: ctx.startupId,
    },
  });
  revalidatePath("/journal");
  return folder;
}

export async function updateWikiFolder(id: string, data: Partial<{ name: string; parentId?: string }>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const folder = await prisma.wikiFolder.update({
    where: {
      id,
      startupId: ctx.startupId
    },
    data,
  });
  revalidatePath("/journal");
  return folder;
}

export async function deleteWikiFolder(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  await prisma.wikiFolder.delete({
    where: {
      id,
      startupId: ctx.startupId
    }
  });
  revalidatePath("/journal");
  return { success: true };
}

export async function createWikiPage(data: { title: string; content: string; folderId?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const page = await prisma.wikiPage.create({
    data: {
      title: data.title,
      content: data.content,
      folderId: data.folderId,
      startupId: ctx.startupId,
    },
  });
  revalidatePath("/journal");
  return page;
}

export async function updateWikiPage(id: string, data: Partial<{ title: string; content: string; folderId?: string }>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  const page = await prisma.wikiPage.update({
    where: {
      id,
      startupId: ctx.startupId
    },
    data,
  });
  revalidatePath("/journal");
  return page;
}

export async function deleteWikiPage(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ctx = await getActiveStartupIdForUser(userId);
  if (!ctx) throw new Error("No startup");

  await prisma.wikiPage.delete({
    where: {
      id,
      startupId: ctx.startupId
    }
  });
  revalidatePath("/journal");
  return { success: true };
}
