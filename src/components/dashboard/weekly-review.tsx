"use client";

import { useEffect, useState } from "react";
import { generateWeeklyReview, trackReviewOpened } from "@/lib/actions/review";
import { createTask } from "@/lib/actions/tasks";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Plus } from "lucide-react";

interface MilestoneOption {
  id: string;
  title: string;
}

interface WeeklyReviewProps {
  review: {
    completedSummary: string | null;
    recommendedFocus: string | null;
    createdAt: Date;
  } | null;
  milestones?: MilestoneOption[];
}

export function WeeklyReview({ review: existingReview, milestones = [] }: WeeklyReviewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(existingReview);
  const [focus, setFocus] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("ff:weekly_review_opened")) {
      sessionStorage.setItem("ff:weekly_review_opened", "1");
      trackReviewOpened();
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateWeeklyReview();
      setReview({
        completedSummary: result.reviewText,
        recommendedFocus: "See full review",
        createdAt: new Date(),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to generate review:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFocus = async () => {
    if (!focus.trim() || !milestoneId) return;
    setSaving(true);
    try {
      await createTask({ milestoneId, title: focus.trim() });
      setFocus("");
      router.refresh();
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border bg-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Weekly Review</h3>
        </div>
        <motion.button
          onClick={handleGenerate}
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating..." : review ? "Refresh" : "Generate"}
        </motion.button>
      </div>

      {review?.completedSummary ? (
        <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
          {review.completedSummary}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No review yet. Click &quot;Generate&quot; to create your weekly review.
          </p>
        </div>
      )}

      {review?.completedSummary && milestones.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Turn a focus item into a task
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border bg-background sm:w-56"
            >
              <option value="">Select milestone</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Task from your review, e.g. Interview 3 lost leads"
              className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background"
            />
            <button
              onClick={handleAddFocus}
              disabled={saving || !focus.trim() || !milestoneId}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              {saving ? "Adding..." : "Add to plan"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}