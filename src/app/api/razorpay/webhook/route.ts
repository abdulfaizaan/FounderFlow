import { NextRequest, NextResponse } from "next/server";
import { applySubscriptionStatus } from "@/lib/subscription-status";
import { track } from "@/lib/analytics";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case "subscription.activated":
    case "subscription.charged": {
      const subscription = event.payload.subscription.entity;
      const founderId = subscription.notes?.founderId;

      if (founderId) {
        await applySubscriptionStatus(founderId, "ACTIVE", {
          currentPeriodEnd: new Date(subscription.current_end * 1000),
        });
        await track("subscription_started", { founderId });
      }
      break;
    }

    case "subscription.cancelled": {
      const subscription = event.payload.subscription.entity;
      const founderId = subscription.notes?.founderId;

      if (founderId) {
        await applySubscriptionStatus(founderId, "CANCELED");
        await track("subscription_cancelled", { founderId });
      }
      break;
    }

    case "subscription.payment_failed": {
      const subscription = event.payload.subscription.entity;
      const founderId = subscription.notes?.founderId;

      if (founderId) {
        await applySubscriptionStatus(founderId, "PAST_DUE");
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
