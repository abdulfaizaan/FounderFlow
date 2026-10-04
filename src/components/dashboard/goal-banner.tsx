"use client";

import { useState } from "react";
import { Target, Calendar, Pencil } from "lucide-react";
import { updateGoal } from "@/lib/actions/goals";
import { useRouter } from "next/navigation";
import { CardHelp } from "./card-help";

interface GoalBannerProps {
  goal: {
    id: string;
    title: string;
    targetDate: Date | null;
    definitionOfSuccess: string | null;
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function GoalBanner({ goal }: GoalBannerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [definitionOfSuccess, setDefinitionOfSuccess] = useState(
    goal.definitionOfSuccess ?? ""
  );
  const [targetDate, setTargetDate] = useState(
    goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);

  const daysLeft = goal.targetDate
    ? Math.ceil(
        (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const targetDateStr = goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No deadline";

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateGoal(goal.id, {
        title: title.trim(),
        definitionOfSuccess: definitionOfSuccess.trim() || undefined,
        targetDate: targetDate ? `${targetDate}T${pad(12)}:${pad(0)}:00` : null,
      });
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-card border border-border p-6 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      {editing ? (
        <div className="space-y-3 pl-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <textarea
            value={definitionOfSuccess}
            onChange={(e) => setDefinitionOfSuccess(e.target.value)}
            placeholder="Definition of success"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            <button
              onClick={save}
              disabled={saving || !title.trim()}
              className="ml-auto inline-flex items-center gap-1 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="pl-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Current goal
                </p>
                <CardHelp title="Current goal">
                  The one outcome you&apos;re steering toward. Recommendations, your schedule,
                  and your weekly review all rank work by how much it moves this goal.
                </CardHelp>
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
              <h2 className="text-xl font-bold mt-1 leading-snug">{goal.title}</h2>
              {goal.definitionOfSuccess && (
                <p className="mt-2 text-sm text-muted-foreground text-balance leading-relaxed">
                  {goal.definitionOfSuccess}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted">
                  <Calendar className="h-3 w-3" />
                  Target: {targetDateStr}
                </span>
                {daysLeft !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                    {daysLeft} days left
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}