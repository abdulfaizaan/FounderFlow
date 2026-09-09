import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Verifies that the currently authenticated user has an active paid subscription.
 * Throws an error if the user is not authenticated or does not have a paid plan.
 */
export async function ensureProSubscription() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: You must be signed in to access this feature.");
  }

  const founder = await prisma.founder.findFirst({
    where: { clerkId: userId },
  });

  if (!founder) {
    throw new Error("Founder profile not found.");
  }

  if (founder.subscriptionStatus !== "active") {
    throw new Error("Subscription Required: This feature is reserved for Pro members.");
  }

  return founder;
}
