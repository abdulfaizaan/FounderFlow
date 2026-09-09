"use client";

import { useState } from "react";
import { submitStandup } from "@/lib/actions/standup";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, ArrowRight, AlertCircle } from "lucide-react";

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sun className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Daily standup</h3>
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
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
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
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
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
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
          />
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
        >
          {loading ? "Saving..." : existingStandup ? "Update standup" : "Submit standup"}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
