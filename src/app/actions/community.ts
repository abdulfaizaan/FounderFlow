"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureProSubscription } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getResources(filters: { category?: string; search?: string }) {
  const where: any = {};
  if (filters.category) where.category = filters.category;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return await prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { founder: { select: { name: true } } },
  });
}

export async function createResource(data: { title: string; description: string; url: string; category: string; tags: string[] }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!founder) throw new Error("Founder profile not found");

  const resource = await prisma.resource.create({
    data: {
      ...data,
      submittedById: founder.id,
    },
  });

  revalidatePath("/community/resources");
  return resource;
}

export async function getJobListings(filters: { location?: string; type?: string }) {
  const where: any = {};
  if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
  if (filters.type) where.type = filters.type;

  return await prisma.jobListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { founder: { select: { name: true } } },
  });
}

export async function createJobListing(data: { title: string; company: string; description: string; location: string; type: string; url: string }) {
  const founder = await ensureProSubscription();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const currentFounder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!currentFounder) throw new Error("Founder profile not found");

  const job = await prisma.jobListing.create({
    data: {
      ...data,
      postedById: currentFounder.id,
    },
  });

  revalidatePath("/community/board");
  return job;
}

export async function getCoFounderPosts(filters: { skills?: string[] }) {
  const where: any = {};
  if (filters?.skills) {
    where.skillsNeeded = { hasSome: filters.skills };
  }

  return await prisma.coFounderPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { founder: { select: { name: true } } },
  });
}

export async function createCoFounderPost(data: { title: string; description: string; skillsNeeded: string[]; skillsOffered: string[]; locationPreference?: string }) {
  const founder = await ensureProSubscription();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const currentFounder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!currentFounder) throw new Error("Founder profile not found");

  const post = await prisma.coFounderPost.create({
    data: {
      ...data,
      postedById: currentFounder.id,
    },
  });

  revalidatePath("/community/board");
  return post;
}

export async function getCommunityEvents(filters: { type?: string }) {
  const where: any = {};
  if (filters?.type) where.type = filters.type;

  return await prisma.communityEvent.findMany({
    where,
    orderBy: { date: "asc" },
    include: { organizer: { select: { name: true } } },
  });
}

export async function createCommunityEvent(data: { title: string; description: string; date: Date; location: string; type: string; capacity?: number }) {
  const founder = await ensureProSubscription();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const currentFounder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!currentFounder) throw new Error("Founder profile not found");

  const event = await prisma.communityEvent.create({
    data: {
      ...data,
      organizerId: currentFounder.id,
    },
  });

  revalidatePath("/community/events");
  return event;
}

export async function rsvpToEvent(eventId: string, status: "GOING" | "MAYBE") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!founder) throw new Error("Founder profile not found");

  const rsvp = await prisma.eventRSVP.upsert({
    where: {
      eventId_founderId: { eventId, founderId: founder.id },
    },
    update: { status },
    create: { eventId, founderId: founder.id, status },
  });

  revalidatePath("/community/events");
  return rsvp;
}
