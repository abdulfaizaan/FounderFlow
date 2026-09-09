"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureProSubscription } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getForumCategories() {
  return await prisma.forumCategory.findMany();
}

export async function getForumThreads({ categoryId, search, page = 1 }: { categoryId?: string; search?: string; page?: number }) {
  const take = 20;
  const skip = (page - 1) * take;

  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        founder: { select: { name: true } },
        category: true,
        _count: { select: { replies: true, votes: true } },
      },
    }),
    prisma.forumPost.count({ where }),
  ]);

  return { posts, total, totalPages: Math.ceil(total / take) };
}

export async function getForumThread(postId: string) {
  return await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      founder: { select: { name: true } },
      category: true,
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          founder: { select: { name: true } },
          replies: {
            include: { founder: { select: { name: true } } },
          },
        },
      },
      _count: { select: { votes: true } },
    },
  });
}

export async function createForumPost(data: { title: string; content: string; categoryId: string }) {
  const founder = await ensureProSubscription();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const post = await prisma.forumPost.create({
    data: {
      title: data.title,
      content: data.content,
      categoryId: data.categoryId,
      founderId: founder.id,
    },
  });

  revalidatePath("/forum");
  return post;
}

export async function createForumReply(data: { postId: string; content: string; parentId?: string }) {
  const founder = await ensureProSubscription();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const reply = await prisma.forumReply.create({
    data: {
      postId: data.postId,
      content: data.content,
      parentId: data.parentId,
      founderId: founder.id,
    },
  });

  revalidatePath(`/forum/${data.postId}`);
  return reply;
}

export async function upvotePost(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!founder) throw new Error("Founder profile not found");

  const existingVote = await prisma.forumVote.findUnique({
    where: { postId_founderId: { postId, founderId: founder.id } },
  });

  if (existingVote) {
    await prisma.forumVote.delete({ where: { id: existingVote.id } });
    await prisma.forumPost.update({
      where: { id: postId },
      data: { upvotes: { decrement: 1 } },
    });
    return { upvoted: false };
  }

  await prisma.forumVote.create({
    data: { postId, founderId: founder.id },
  });
  await prisma.forumPost.update({
    where: { id: postId },
    data: { upvotes: { increment: 1 } },
  });

  return { upvoted: true };
}
