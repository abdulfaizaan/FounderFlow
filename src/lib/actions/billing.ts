"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { getStripe } from "@/lib/stripe";
import { applySubscriptionStatus } from "@/lib/subscription-status";
import { env } from "@/lib/env";
import { revalidatePath } from "next/cache";

const PROVIDERS = ["razorpay", "stripe"] as const;
export type BillingProvider = (typeof PROVIDERS)[number];

export async function setProvider(provider: BillingProvider) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
  });
  if (!founder) throw new Error("No founder found");
  if (!PROVIDERS.includes(provider)) throw new Error("Invalid provider");

  await prisma.subscription.update({
    where: { founderId: founder.id },
    data: { provider },
  });

  revalidatePath("/billing");
}

export async function startTrial() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
  });

  if (!founder) throw new Error("No founder found");

  // Check if subscription already exists
  const existing = await prisma.subscription.findUnique({
    where: { founderId: founder.id },
  });

  if (existing) return existing;

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const subscription = await prisma.subscription.create({
    data: {
      founderId: founder.id,
      plan: "trial",
      status: "TRIAL",
      trialEndsAt,
    },
  });

  // Update founder's subscription status
  await prisma.founder.update({
    where: { id: founder.id },
    data: { subscriptionStatus: "TRIAL" },
  });

  revalidatePath("/billing");
  return subscription;
}

export async function createSubscription(plan: "monthly" | "yearly") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
  });

  if (!founder) throw new Error("No founder found");

  // Ensure trial is started
  let subscription = await prisma.subscription.findUnique({
    where: { founderId: founder.id },
  });

  if (!subscription) {
    subscription = await startTrial();
  }

  if (subscription.provider === "stripe") {
    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe is not configured");

    const priceId =
      plan === "monthly" ? env.STRIPE_PRICE_MONTHLY : env.STRIPE_PRICE_YEARLY;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: founder.email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/billing?status=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing?status=cancelled`,
      metadata: { founderId: founder.id },
      subscription_data: {
        metadata: { founderId: founder.id },
      },
    });

    return { checkoutUrl: session.url }; // session.id survives on the subscription via webhook
  }

  // Create or get Razorpay customer
  const razorpay = getRazorpay();
  if (!razorpay) throw new Error("Razorpay is not configured");

  let customerId = subscription.razorpayCustomerId;

  if (!customerId) {
    const customer = await razorpay.customers.create({
      name: founder.name || "Founder",
      email: founder.email,
    });
    customerId = customer.id;

    await prisma.subscription.update({
      where: { founderId: founder.id },
      data: { razorpayCustomerId: customerId },
    });
  }

  // Create Razorpay subscription
  const rzSub = await razorpay.subscriptions.create({
    plan_id: plan === "monthly" ? "plan_monthly" : "plan_yearly",
    total_count: 12,
    notes: {
      founderId: founder.id,
    },
  } as any); // Razorpay SDK types incomplete for customer_id

  await prisma.subscription.update({
    where: { founderId: founder.id },
    data: {
      razorpaySubscriptionId: rzSub.id,
      status: "PENDING",
    },
  });

  revalidatePath("/billing");
  return { subscriptionId: rzSub.id };
}

export async function cancelSubscription() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
  });

  if (!founder) throw new Error("No founder found");

  const subscription = await prisma.subscription.findUnique({
    where: { founderId: founder.id },
  });

  await applySubscriptionStatus(founder.id, "CANCELED");

  if (subscription?.provider === "stripe" && subscription.stripeSubscriptionId) {
    const stripe = getStripe();
    if (stripe) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } else if (subscription?.razorpaySubscriptionId) {
    const razorpay = getRazorpay();
    if (razorpay) {
      await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
    }
  }

  revalidatePath("/billing");
}

export async function getSubscriptionStatus() {
  const { userId } = await auth();
  if (!userId) return null;

  const founder = await prisma.founder.findUnique({
    where: { clerkId: userId },
  });

  if (!founder) return null;

  const subscription = await prisma.subscription.findUnique({
    where: { founderId: founder.id },
  });

  if (!subscription) {
    return await startTrial();
  }

  // Check if trial expired
  if (subscription.status === "TRIAL" && subscription.trialEndsAt) {
    if (new Date() > subscription.trialEndsAt) {
      await prisma.subscription.update({
        where: { founderId: founder.id },
        data: { status: "EXPIRED" },
      });

      await prisma.founder.update({
        where: { id: founder.id },
        data: { subscriptionStatus: "EXPIRED" },
      });

      return { ...subscription, status: "EXPIRED" };
    }
  }

  return subscription;
}

export async function isTrialOrSubscribed() {
  const status = await getSubscriptionStatus();
  if (!status) return false;
  return ["TRIAL", "ACTIVE"].includes(status.status);
}
