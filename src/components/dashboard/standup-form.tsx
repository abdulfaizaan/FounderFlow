"use client";

import { useState } from "react";
import { submitStandup } from "@/lib/actions/standup";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Sun, ArrowRight, AlertCircle } from "lucide-react";
import { CardHelp } from "./card-help";

interface StandupFormProps {
  existingStandup?: {
    yesterday: string | null;
    today: string | null;
    blockers: string | null;
  } | null;
}

export function StandupForm({ existingStandup }: StandupFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    yesterday: existingStandup?.yesterday || "",
    today: existingStandup?.today || "",
    blockers: existingStandup?.blockers || "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitStandup(data);
      router.refresh();
    } catch (error) {
      console.error("Failed to submit standup:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sun className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Daily standup</h3>
        <CardHelp title="Daily standup">
          A quick pulse on yesterday, today&apos;s focus, and blockers. Your focus shows up in
          Today&apos;s summary and blockers surface where help is needed.
        </CardHelp>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            What did you accomplish yesterday?
          </label>
          <textarea
            value={data.yesterday}
            onChange={(e) => setData((d) => ({ ...d, yesterday: e.target.value }))}
            placeholder="Shipped landing page..."
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            What's the focus today?
          </label>
          <textarea
            value={data.today}
            onChange={(e) => setData((d) => ({ ...d, today: e.target.value }))}
            placeholder="Talk to 3 potential customers..."
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Blockers (optional)
          </label>
          <textarea
            value={data.blockers}
            onChange={(e) => setData((d) => ({ ...d, blockers: e.target.value }))}
            placeholder="Anything stuck?"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-press inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : existingStandup ? "Update standup" : "Submit standup"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
