"use client";

import { useState } from "react";
import { recordEvidence } from "@/lib/actions/evidence";
import { motion } from "framer-motion";
import { DollarSign, Save } from "lucide-react";

export function RevenueEvidenceForm() {
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
    } catch (error) {
      console.error("Failed to record revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-4 w-4 text-success" />
        <h3 className="text-sm font-semibold">Record Revenue Win</h3>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            type="number"
            className="w-full pl-6 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Customer feedback or deal notes..."
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !value}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : <><Save className="h-4 w-4" /> Log Revenue</>}
        </button>
      </div>
    </div>
  );
}
