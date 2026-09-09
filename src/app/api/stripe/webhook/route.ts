import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { applySubscriptionStatus } from "@/lib/subscription-status";
import { track } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const founderId = (session.metadata as Record<string, string> | undefined)?.founderId;

      if (founderId) {
        await applySubscriptionStatus(founderId, "ACTIVE");
        await track("subscription_started", { founderId });

        const subId = session.subscription
          ? typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id
          : null;

        if (subId) {
          await prisma.subscription.update({
            where: { founderId },
            data: {
              stripeSubscriptionId: subId,
              stripeCustomerId: session.customer
                ? typeof session.customer === "string"
                  ? session.customer
                  : session.customer.id
                : null,
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const founderId = (sub.metadata as Record<string, string> | undefined)?.founderId;

      if (founderId) {
        await applySubscriptionStatus(founderId, "CANCELED");
        await track("subscription_cancelled", { founderId });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as unknown as {
        subscription: string | Stripe.Subscription | null;
      };
      const sub = invoice.subscription;
      const subscribed =
        typeof sub === "string" ? await stripe.subscriptions.retrieve(sub) : sub;

      const founderId = (subscribed?.metadata as Record<string, string> | undefined)?.founderId;

      if (founderId) {
        await applySubscriptionStatus(founderId, "PAST_DUE");
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}