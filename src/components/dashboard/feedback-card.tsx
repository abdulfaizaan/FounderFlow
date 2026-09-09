"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordRecommendationFeedback } from "@/lib/actions/dashboard";
import { ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

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
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-2xl border bg-card/60 p-3 flex items-center justify-between"
    >
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        Was today&apos;s suggestion useful?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => submit("HELPFUL")}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful
        </button>
        <button
          onClick={() => submit("NOT_HELPFUL")}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          Not helpful
        </button>
      </div>
    </motion.div>
  );
}