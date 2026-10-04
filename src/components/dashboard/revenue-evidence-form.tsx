"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordEvidence } from "@/lib/actions/evidence";
import { motion } from "motion/react";
import { DollarSign, Save } from "lucide-react";
import { CardHelp } from "./card-help";

export function RevenueEvidenceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!value) return;
    setLoading(true);
    try {
      await recordEvidence({
        type: "REVENUE",
        value: parseFloat(value),
        note: note,
      });
      setValue("");
      setNote("");
      router.refresh();
    } catch (error) {
      console.error("Failed to record revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Record Revenue Win</h3>
        <CardHelp title="Record Revenue Win">
          Every dollar that came in today. Revenue evidence is counted separately from other
          signals and feeds your weekly summary.
        </CardHelp>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            type="number"
            className="w-full pl-6 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Customer feedback or deal notes..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !value}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : <><Save className="h-4 w-4" /> Log Revenue</>}
        </button>
      </div>
    </div>
  );
}
