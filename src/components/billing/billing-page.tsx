"use client";

import { useState } from "react";
import {
  createSubscription,
  cancelSubscription,
  setProvider,
} from "@/lib/actions/billing";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Zap, Calendar, CreditCard } from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  provider: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
}

interface BillingPageProps {
  subscription: Subscription | null;
}

export function BillingPage({ subscription: sub }: BillingPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setLoading(true);
    try {
      const result = await createSubscription(plan);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      alert(`Subscription created! ID: ${result.subscriptionId}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetProvider = async (provider: "razorpay" | "stripe") => {
    if (provider === sub?.provider) return;
    try {
      await setProvider(provider);
      router.refresh();
    } catch (error) {
      console.error("Failed to set provider:", error);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel?")) return;
    setLoading(true);
    try {
      await cancelSubscription();
      router.refresh();
    } catch (error) {
      console.error("Failed to cancel:", error);
    } finally {
      setLoading(false);
    }
  };

  const isTrialActive = sub?.status === "TRIAL" && sub.trialEndsAt && new Date(sub.trialEndsAt) > new Date();
  const isActive = sub?.status === "ACTIVE";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing</p>
      </div>

      {sub && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border bg-card p-6"
        >
          <p className="text-sm text-muted-foreground">Current plan</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              sub.status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : sub.status === "TRIAL"
                ? "bg-[#6349ea]/10 text-[#6349ea]"
                : sub.status === "EXPIRED"
                ? "bg-red-100 text-red-700"
                : "bg-muted text-muted-foreground"
            }`}>
              {sub.status}
            </span>
            {isTrialActive && sub.trialEndsAt && (
              <span className="text-sm text-muted-foreground">
                Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()}
              </span>
            )}
            {isActive && sub.currentPeriodEnd && (
              <span className="text-sm text-muted-foreground">
                Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {(!sub || sub.status === "TRIAL" || sub.status === "EXPIRED") && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Payment provider
          </h2>
          <div className="flex gap-2 mb-6">
            {(["razorpay", "stripe"] as const).map((p) => (
              <button
                key={p}
                onClick={() => handleSetProvider(p)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                  sub?.provider === p
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {(!sub || sub.status === "TRIAL" || sub.status === "EXPIRED") && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Choose a plan
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border bg-card p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Monthly</h3>
              </div>
              <p className="mt-3">
                <span className="text-3xl font-bold">₹599</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {["Unlimited goals & tasks", "AI recommendations", "Weekly reviews", "AI copilot"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={loading}
                className="w-full mt-6 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Subscribe monthly"}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border-2 border-primary bg-card p-6 relative shadow-xl shadow-primary/10"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6349ea] to-[#875fe0] text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                Save 30%
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Yearly</h3>
              </div>
              <p className="mt-3">
                <span className="text-3xl font-bold">₹4,999</span>
                <span className="text-sm text-muted-foreground">/year</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {["Everything in Monthly", "2 months free", "Priority support", "Early access to new features"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe("yearly")}
                disabled={loading}
                className="w-full mt-6 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Subscribe yearly"}
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-1">Cancel subscription</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your subscription will remain active until the end of the current billing period.
          </p>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Cancel subscription
          </button>
        </motion.div>
      )}
    </div>
  );
}