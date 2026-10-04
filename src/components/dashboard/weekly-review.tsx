"use client";

import { useEffect, useState } from "react";
import { generateWeeklyReview, trackReviewOpened } from "@/lib/actions/review";
import { createTask } from "@/lib/actions/tasks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MilestoneOption {
  id: string;
  title: string;
}

interface WeeklyReviewProps {
  review: {
    completedSummary: string | null;
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
        createdAt: new Date(),
      });
      router.refresh();
    } catch {
      toast.error("Could not generate review. Try again.");
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
      toast.success("Task added to your plan");
      router.refresh();
    } catch {
      toast.error("Could not add task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {review?.createdAt
            ? `Generated ${new Date(review.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}`
            : "A weekly summary of what you completed and where to focus next."}
        </p>
        <Button size="sm" onClick={handleGenerate} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating…" : review ? "Refresh" : "Generate"}
        </Button>
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
            <Input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Task from your review, e.g. Interview 3 lost leads"
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleAddFocus}
              disabled={saving || !focus.trim() || !milestoneId}
              className="self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              {saving ? "Adding…" : "Add to plan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}