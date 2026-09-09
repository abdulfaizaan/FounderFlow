"use client";

import { useState } from "react";
import { recordEvidence } from "@/lib/actions/evidence";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";

const EVIDENCE_TYPES = [
  { value: "conversation", label: "Customer conversation" },
  { value: "prospect", label: "New prospect" },
  { value: "customer", label: "Paying customer" },
  { value: "revenue", label: "Revenue" },
  { value: "conversion", label: "Conversion" },
  { value: "custom", label: "Custom metric" },
];

export function EvidenceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    type: "conversation",
    value: "",
    note: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await recordEvidence({
        type: data.type,
        value: data.value ? parseFloat(data.value) : undefined,
        note: data.note || undefined,
      });
      setData({ type: "conversation", value: "", note: "" });
      router.refresh();
    } catch (error) {
      console.error("Failed to record evidence:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-2xl border bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Record evidence</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Type
          </label>
          <select
            value={data.type}
            onChange={(e) => setData((d) => ({ ...d, type: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
          >
            {EVIDENCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Value (optional)
          </label>
          <input
            type="number"
            value={data.value}
            onChange={(e) => setData((d) => ({ ...d, value: e.target.value }))}
            placeholder="e.g. 49"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            value={data.note}
            onChange={(e) => setData((d) => ({ ...d, note: e.target.value }))}
            placeholder="Quick context..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
          />
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {loading ? "Saving..." : "Record"}
        </motion.button>
      </div>
    </motion.div>
  );
}
