import { prisma } from "@/lib/prisma";

// Shared subscription-status update used by both provider webhooks.
export async function applySubscriptionStatus(
  founderId: string,
  status: string,
  extra?: { currentPeriodEnd?: Date }
) {
  await prisma.subscription.update({
    where: { founderId },
    data: { status, ...extra },
  });

  await prisma.founder.update({
    where: { id: founderId },
    data: { subscriptionStatus: status },
  });
}