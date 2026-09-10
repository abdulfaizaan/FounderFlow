import Razorpay from "razorpay";
import { env } from "./env";

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay | null {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return null;
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}
