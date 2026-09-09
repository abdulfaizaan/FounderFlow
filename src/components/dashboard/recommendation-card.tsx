"use client";

import { useState } from "react";
import { completeTask, scheduleTask, updateTask } from "@/lib/actions/tasks";
import { dismissRecommendation, snoozeRecommendation } from "@/lib/actions/dashboard";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  X,
  Pencil,
  Moon,
  BadgeCheck,
} from "lucide-react";

interface EvidenceChip {
  id: string;
  type: string;
  value: number | null;
  note: string | null;
}

interface Recommendation {
  taskId: string;
  title: string;
  description: string | null;
  confidence: number;
  rationale: string;
  goalTitle: string;
  milestoneTitle: string;
  estimateMinutes: number;
  dueDate: Date | null;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  isPrimary?: boolean;
  onAction?: () => void;
  evidence?: EvidenceChip[];
}

function defaultSlot(): string {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function RecommendationCard({
  recommendation: rec,
  isPrimary = true,
  onAction,
  evidence = [],
}: RecommendationCardProps) {
  const router = useRouter();
  const [scheduling, setScheduling] = useState(false);
  const [slot, setSlot] = useState(defaultSlot());
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(rec.title);
  const [estimate, setEstimate] = useState(rec.estimateMinutes);
  const [due, setDue] = useState(
    rec.dueDate ? rec.dueDate.toISOString().slice(0, 10) : ""
  );

  const done = async () => {
    await completeTask(rec.taskId);
    onAction?.();
    router.refresh();
  };

  const dismiss = async () => {
    await dismissRecommendation(rec.taskId);
    onAction?.();
    router.refresh();
  };

  const snooze = async () => {
    await snoozeRecommendation(rec.taskId);
    onAction?.();
    router.refresh();
  };

  const save = async () => {
    await scheduleTask(rec.taskId, new Date(slot).toISOString());
    setScheduling(false);
    onAction?.();
    router.refresh();
  };

  const saveEdit = async () => {
    await updateTask(rec.taskId, {
      title: title.trim(),
      estimateMinutes: estimate,
      dueDate: due ? `${due}T${pad(9)}:${pad(0)}:00` : undefined,
    });
    setEditing(false);
    onAction?.();
    router.refresh();
  };

  const hrs = Math.floor(rec.estimateMinutes / 60);
  const mins = rec.estimateMinutes % 60;
  const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  const evidenceLabel = (t: string) => t.replace(/_/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={`rounded-2xl border p-5 ${
        isPrimary
          ? "bg-card shadow-lg shadow-primary/5 border-primary/20"
          : "bg-card/60 border-border hover:bg-card"
      }`}
    >
      {isPrimary && (
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
            <Sparkles className="h-3 w-3" />
            Recommended
          </span>
          <span className="text-xs text-muted-foreground">{rec.confidence}% confidence</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {rec.milestoneTitle}
          </p>
          <h4 className={`font-semibold mt-0.5 leading-snug ${isPrimary ? "text-lg" : "text-sm"}`}>
            {rec.title}
          </h4>
          {rec.description && (
            <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Clock className="h-3 w-3" />
          {timeStr}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-3">{rec.rationale}</p>

      {evidence.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="text-[11px] text-muted-foreground font-medium mr-1">
            Recent evidence
          </span>
          {evidence.slice(0, 4).map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              title={e.note ?? undefined}
            >
              <BadgeCheck className="h-3 w-3" />
              {evidenceLabel(e.type)}: {e.value ?? "recorded"}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span>Milestone: {rec.milestoneTitle}</span>
        <span>&middot;</span>
        <span>{rec.estimateMinutes} min</span>
        {rec.dueDate && (
          <>
            <span>&middot;</span>
            <span>
              Due {new Date(rec.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </>
        )}
      </div>

      {isPrimary && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={done}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              Do it now
            </button>
            <button
              onClick={() => setScheduling((s) => !s)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Calendar className="h-4 w-4" />
              {scheduling ? "Cancel" : "Schedule"}
            </button>
            <button
              onClick={snooze}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Moon className="h-4 w-4" />
              Snooze
            </button>
            <button
              onClick={() => setEditing((e) => !e)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={dismiss}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Skip
            </button>
          </div>

          {scheduling && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
              <input
                type="datetime-local"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <button
                onClick={save}
                disabled={!slot}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          )}

          {editing && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={estimate}
                  onChange={(e) => setEstimate(Number(e.target.value))}
                  placeholder="Minutes"
                  className="w-28 rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
                <input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveEdit}
                  disabled={!title.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  Save changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}