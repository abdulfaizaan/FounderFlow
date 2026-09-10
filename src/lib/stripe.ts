import Stripe from "stripe";
import { env } from "./env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(env.STRIPE_SECRET_KEY);
  return _stripe;
}