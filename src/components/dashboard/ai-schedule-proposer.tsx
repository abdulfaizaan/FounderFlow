"use client";

import { useState } from "react";
import { proposeSchedule, applyProposedSchedule } from "@/lib/actions/copilot";
import { motion } from "framer-motion";
import { Sparkles, Check, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export function AIScheduleProposer() {
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<{ taskId: string; startTime: string; title?: string }[] | null>(null);
  const router = useRouter();

  const handlePropose = async () => {
    setLoading(true);
    try {
      const schedule = await proposeSchedule();
      // We don't have titles in the proposal, so we just store the IDs
      setProposal(schedule);
    } catch (error) {
      console.error("Propose failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!proposal) return;
    setLoading(true);
    try {
      await applyProposedSchedule(proposal);
      setProposal(null);
      router.refresh();
    } catch (error) {
      console.error("Apply failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!proposal) {
    return (
      <button
        onClick={handlePropose}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {loading ? "Analyzing..." : <><Sparkles className="h-4 w-4" /> AI Suggest Schedule</>}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-lg animate-rise">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Proposed Schedule</h3>
        </div>
        <button onClick={() => setProposal(null)} className="p-1 hover:bg-muted rounded-md">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2 mb-4">
        {proposal.map((item, i) => (
          <div key={item.taskId} className="flex items-center justify-between p-2 rounded-lg bg-background border">
            <div className="flex items-center gap-3">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-mono font-bold">{item.startTime}</span>
              <span className="text-xs text-muted-foreground">Task {item.taskId.slice(0, 5)}...</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <Check className="h-3 w-3" /> Apply All
        </button>
        <button
          onClick={() => setProposal(null)}
          className="px-3 py-2 text-xs font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
