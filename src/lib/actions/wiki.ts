"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWikiStructure(startupId: string) {
  const folders = await prisma.wikiFolder.findMany({
    where: { startupId },
    orderBy: { name: "asc" },
  });
  const pages = await prisma.wikiPage.findMany({
    where: { startupId },
    orderBy: { title: "asc" },
  });

  return { folders, pages };
}

export async function createWikiFolder(data: { name: string; parentId?: string }, startupId: string) {
  const folder = await prisma.wikiFolder.create({
    data: {
      name: data.name,
      parentId: data.parentId,
      startupId,
    },
  });
  revalidatePath("/wiki");
  return folder;
}

export async function updateWikiFolder(id: string, data: Partial<{ name: string; parentId?: string }>) {
  const folder = await prisma.wikiFolder.update({
    where: { id },
    data,
  });
  revalidatePath("/wiki");
  return folder;
}

export async function deleteWikiFolder(id: string) {
  await prisma.wikiFolder.delete({ where: { id } });
  revalidatePath("/wiki");
  return { success: true };
}

export async function createWikiPage(data: { title: string; content: string; folderId?: string }, startupId: string) {
  const page = await prisma.wikiPage.create({
    data: {
      title: data.title,
      content: data.content,
      folderId: data.folderId,
      startupId,
    },
  });
  revalidatePath("/wiki");
  return page;
}

export async function updateWikiPage(id: string, data: Partial<{ title: string; content: string; folderId?: string }>) {
  const page = await prisma.wikiPage.update({
    where: { id },
    data,
  });
  revalidatePath("/wiki");
  return page;
}

export async function deleteWikiPage(id: string) {
  await prisma.wikiPage.delete({ where: { id } });
  revalidatePath("/wiki");
  return { success: true };
}
