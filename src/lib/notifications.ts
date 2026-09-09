import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { env } from "@/lib/env";
import { auth } from "@clerk/nextjs/server";

export enum NotificationType {
  MENTION = "MENTION",
  REPLY = "REPLY",
  EVENT = "EVENT",
  MILESTONE = "MILESTONE",
  SYSTEM = "SYSTEM",
}

export async function notify(
  founderId: string,
  type: NotificationType,
  content: { title: string; body: string; link?: string }
) {
  // 1. Persist for In-App Notification Center
  const notification = await prisma.notification.create({
    data: {
      founderId,
      type,
      ...content,
    },
  });

  // 2. Fetch User Preferences
  const prefs = await prisma.notificationPreference.findUnique({
    where: { founderId },
  });

  if (!prefs) return;

  const isCategoryEnabled = (prefs.categorySettings as any)[type] ?? true;
  if (!isCategoryEnabled) return;

  // 3. Real-time In-App Update (via Pusher)
  if (prefs.inAppEnabled) {
    await pusherServer.trigger(`user-${founderId}`, "notification-received", notification);
  }

  // 4. Email Dispatch (Placeholder - In real app use Resend/SendGrid)
  if (prefs.emailEnabled) {
    console.log(`[EMAIL] Sending ${type} notification to founder ${founderId}: ${content.title}`);
    // await resend.emails.send({ ... });
  }
}
