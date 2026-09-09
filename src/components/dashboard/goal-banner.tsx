"use client";

import { useState } from "react";
import { Target, Calendar, Pencil } from "lucide-react";
import { updateGoal } from "@/lib/actions/goals";
import { useRouter } from "next/navigation";

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
    <div className="rounded-2xl bg-gradient-to-br from-[#6349ea] to-[#875fe0] p-6 text-white shadow-xl shadow-primary/20">
      {editing ? (
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          />
          <textarea
            value={definitionOfSuccess}
            onChange={(e) => setDefinitionOfSuccess(e.target.value)}
            placeholder="Definition of success"
            rows={2}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm resize-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-44 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 [color-scheme:dark]"
            />
            <button
              onClick={save}
              disabled={saving || !title.trim()}
              className="ml-auto inline-flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white text-[#6349ea] rounded-lg hover:bg-white/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <Target className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">
                  Current goal
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
              <h2 className="text-xl font-bold mt-1 leading-snug">{goal.title}</h2>
              {goal.definitionOfSuccess && (
                <p className="mt-2 text-sm opacity-90 text-balance leading-relaxed">
                  {goal.definitionOfSuccess}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3 text-xs opacity-90">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15">
                  <Calendar className="h-3 w-3" />
                  Target: {targetDateStr}
                </span>
                {daysLeft !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 font-medium">
                    {daysLeft} days left
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}