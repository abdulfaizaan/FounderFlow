"use client";

import { CheckCircle2, FileText, Clock, AlertCircle, Check, X } from "lucide-react";
import { resolveBlocker, dismissBlocker } from "@/lib/actions/blockers";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CardHelp } from "./card-help";

interface WeekSummaryProps {
  tasksDone: number;
  tasksTotal: number;
  evidenceCount: number;
  blockers: { id: string; description: string }[];
  availableMinutes: number;
}

export function WeekSummary({ tasksDone, tasksTotal, evidenceCount, blockers, availableMinutes }: WeekSummaryProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hours = Math.floor(availableMinutes / 60);
  const mins = availableMinutes % 60;
  const pctDone = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  const handleAction = async (action: (id: string) => Promise<void>, id: string) => {
    startTransition(async () => {
      try {
        await action(id);
        router.refresh();
      } catch (error) {
        console.error(`Failed to process blocker ${id}:`, error);
      }
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-1.5 mb-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          This Week
        </h3>
        <CardHelp title="This Week">
          Your seven-day snapshot: tasks completed against total, evidence logged, and open
          blockers you can resolve or dismiss right here.
        </CardHelp>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-muted/50 p-4 text-center transition-colors duration-150 hover:bg-muted/80">
          <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{tasksDone}/{tasksTotal}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tasks done</p>
          <div className="h-1.5 w-full bg-border rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pctDone}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-center transition-colors duration-150 hover:bg-muted/80">
          <FileText className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{evidenceCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Evidence</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-center transition-colors duration-150 hover:bg-muted/80">
          <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{hours}h{mins > 0 ? ` ${mins}m` : ""}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Available</p>
        </div>
      </div>

      {blockers.length > 0 && (
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-xs font-medium text-destructive flex items-center gap-1 mb-2">
            <AlertCircle className="h-3 w-3" />
            Open Blockers ({blockers.length})
          </p>
          <div className="space-y-1.5">
            {blockers.map((b) => (
              <div key={b.id} className="text-sm text-muted-foreground flex items-center justify-between gap-2 group">
                <div className="flex items-start gap-2 overflow-hidden">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                  <p className="truncate">{b.description}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleAction(resolveBlocker, b.id)}
                    disabled={isPending}
                    className="p-1 hover:bg-primary/20 hover:text-primary rounded transition-colors"
                    title="Resolve"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleAction(dismissBlocker, b.id)}
                    disabled={isPending}
                    className="p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
                    title="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}