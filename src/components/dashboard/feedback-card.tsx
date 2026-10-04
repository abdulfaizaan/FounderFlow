"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordRecommendationFeedback } from "@/lib/actions/dashboard";
import { ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

export function FeedbackCard({ hasRecommendation }: { hasRecommendation: boolean }) {
  const router = useRouter();
  const [done, setDone] = useState<string | null>(null);

  if (!hasRecommendation || done) return null;

  const submit = async (feedback: "HELPFUL" | "NOT_HELPFUL") => {
    setDone(feedback);
    await recordRecommendationFeedback(feedback);
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="rounded-xl border border-border bg-card p-3 flex items-center justify-between"
    >
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        Was today&apos;s suggestion useful?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => submit("HELPFUL")}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful
        </button>
        <button
          onClick={() => submit("NOT_HELPFUL")}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          Not helpful
        </button>
      </div>
    </motion.div>
  );
}