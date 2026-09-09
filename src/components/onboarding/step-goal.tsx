"use client";

import { GOAL_TEMPLATES } from "@/lib/templates";
import { Check } from "lucide-react";

interface StepData {
  goalTitle: string;
  targetDate: string;
  definitionOfSuccess: string;
  milestoneTitle: string;
  tasks: { title: string; estimateMinutes: number }[];
}

interface StepGoalProps {
  data: StepData;
  updateData: (partial: Partial<StepData>) => void;
}

export function StepGoal({ data, updateData }: StepGoalProps) {
  const selected = GOAL_TEMPLATES.find((t) => t.goalTitle === data.goalTitle) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <p className="block text-sm font-medium mb-2">Start from a template (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GOAL_TEMPLATES.map((t) => {
            const active = selected?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  updateData({
                    goalTitle: t.goalTitle,
                    definitionOfSuccess: t.definitionOfSuccess,
                    milestoneTitle: t.milestoneTitle,
                    tasks: t.tasks.map((task) => ({ ...task })),
                  })
                }
                className={`rounded-lg border p-3 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                  {t.label}
                </span>
                <span className="block text-xs text-muted-foreground mt-1">
                  {t.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="goalTitle" className="block text-sm font-medium mb-1">
          What&apos;s your primary goal?
        </label>
        <input
          id="goalTitle"
          type="text"
          value={data.goalTitle}
          onChange={(e) => updateData({ goalTitle: e.target.value })}
          placeholder="e.g. Get my first 10 paying customers"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="targetDate" className="block text-sm font-medium mb-1">
          Target date (optional)
        </label>
        <input
          id="targetDate"
          type="date"
          value={data.targetDate}
          onChange={(e) => updateData({ targetDate: e.target.value })}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="definitionOfSuccess" className="block text-sm font-medium mb-1">
          How will you know you&apos;ve succeeded?
        </label>
        <textarea
          id="definitionOfSuccess"
          value={data.definitionOfSuccess}
          onChange={(e) => updateData({ definitionOfSuccess: e.target.value })}
          placeholder="e.g. 10 customers paying $49/month for 2 consecutive months"
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}