"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getPusher } from "@/lib/pusher";
import { ensureProSubscription } from "@/lib/auth-utils";

export async function listChannels() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let channels = await prisma.channel.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (channels.length === 0) {
    const defaultChannels = [
      { name: "general", description: "Main hangout for all founders" },
      { name: "fundraising", description: "Discuss pitch decks and VC relations" },
      { name: "growth", description: "User acquisition and marketing strategies" },
      { name: "tech-stack", description: "Tools, frameworks, and infrastructure" },
      { name: "mental-health", description: "The emotional side of the founder journey" },
    ];

    await prisma.$transaction(
      defaultChannels.map((c) => prisma.channel.create({ data: c }))
    );

    channels = await prisma.channel.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  return channels;
}

export async function getMessages(channelId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.message.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: {
      founder: {
        select: { name: true },
      },
    },
  });
}

export async function sendMessage(channelId: string, content: string) {
  const founder = await ensureProSubscription();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get the founder record for the current user
  const currentFounder = await prisma.founder.findUnique({
    where: { clerkId: userId },
  });

  if (!currentFounder) throw new Error("Founder profile not found");

  const message = await prisma.message.create({
    data: {
      channelId,
      founderId: currentFounder.id,
      content,
    },
    include: {
      founder: {
        select: { name: true },
      },
    },
  });

  // Trigger Pusher event
  const pusherServer = getPusher();
  if (pusherServer) {
    await pusherServer.trigger(`channel-${channelId}`, "new-message", message);
  }

  return message;
}

export async function createChannel(name: string, description?: string) {
  // In a real app, this would be admin-only
  return await prisma.channel.create({
    data: { name, description },
  });
}
