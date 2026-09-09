"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!founder) throw new Error("Founder profile not found");

  return await prisma.notification.findMany({
    where: { founderId: founder.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!founder) throw new Error("Founder profile not found");

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  revalidatePath("/"); // Update all pages
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!founder) throw new Error("Founder profile not found");

  await prisma.notification.updateMany({
    where: { founderId: founder.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateNotificationPreferences(settings: Record<string, boolean>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({ where: { clerkId: userId } });
  if (!founder) throw new Error("Founder profile not found");

  await prisma.notificationPreference.upsert({
    where: { founderId: founder.id },
    update: { categorySettings: settings },
    create: {
      founderId: founder.id,
      categorySettings: settings,
    },
  });

  return { success: true };
}
