"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createJournalEntry,
  deleteJournalEntry,
} from "@/lib/actions/journal";
import { JOURNAL_TYPES } from "@/lib/constants/journal";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, PenLine, Lightbulb, GitBranch, BookOpen, Trophy, Flame, Users } from "lucide-react";

type Entry = {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
};

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  IDEA: { label: "Idea", icon: Lightbulb, color: "text-yellow-500 bg-yellow-500/10" },
  DECISION: { label: "Decision", icon: GitBranch, color: "text-sky-500 bg-sky-500/10" },
  LESSON: { label: "Lesson", icon: BookOpen, color: "text-violet-500 bg-violet-500/10" },
  WIN: { label: "Win", icon: Trophy, color: "text-emerald-500 bg-emerald-500/10" },
  FAILURE: { label: "Failure", icon: Flame, color: "text-rose-500 bg-rose-500/10" },
  CUSTOMER_INSIGHT: { label: "Customer insight", icon: Users, color: "text-indigo-500 bg-indigo-500/10" },
};

export function JournalView({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");
  const [type, setType] = useState("IDEA");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    try {
      await createJournalEntry({ type: type as any, content });
      setContent("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const visible = filter === "ALL" ? entries : entries.filter((e) => e.type === filter);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-1 mb-3">
          {JOURNAL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                type === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {TYPE_META[t]?.label}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What happened? Write it down before it fades…"
          rows={3}
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={submit}
            disabled={!content.trim() || saving}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            <PenLine className="h-4 w-4" />
            {saving ? "Saving…" : "Add entry"}
          </button>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "ALL"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {JOURNAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === t
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {TYPE_META[t]?.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {visible.length === 0 && (
            <div className="rounded-2xl border border-dashed bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {filter === "ALL"
                  ? "No entries yet. Capture your first thought above."
                  : "No entries of this type yet."}
              </p>
            </div>
          )}
          {visible.map((e, i) => {
            const meta = TYPE_META[e.type];
            const Icon = meta?.icon ?? BookOpen;
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                className="rounded-2xl border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta?.color ?? ""}`}
                    >
                      <Icon className="h-3 w-3" />
                      {meta?.label ?? e.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteJournalEntry(e.id);
                      router.refresh();
                    }}
                    className="text-muted-foreground hover:text-rose-500 rounded-lg p-1 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{e.content}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}