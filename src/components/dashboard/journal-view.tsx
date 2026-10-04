"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createJournalEntry,
  deleteJournalEntry,
} from "@/lib/actions/journal";
import { JOURNAL_TYPES } from "@/lib/constants/journal";
import { toast } from "sonner";
import { Trash2, PenLine, Lightbulb, GitBranch, BookOpen, Trophy, Flame, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Entry = {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
};

const TYPE_META: Record<string, { label: string; icon: any }> = {
  IDEA: { label: "Idea", icon: Lightbulb },
  DECISION: { label: "Decision", icon: GitBranch },
  LESSON: { label: "Lesson", icon: BookOpen },
  WIN: { label: "Win", icon: Trophy },
  FAILURE: { label: "Failure", icon: Flame },
  CUSTOMER_INSIGHT: { label: "Customer insight", icon: Users },
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
    } catch {
      toast.error("Could not save entry");
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (id: string) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteJournalEntry(id);
      router.refresh();
    } catch {
      toast.error("Could not delete entry");
    }
  };

  const visible = filter === "ALL" ? entries : entries.filter((e) => e.type === filter);

  const chipClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-1 mb-3 overflow-x-auto">
          {JOURNAL_TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} className={`shrink-0 ${chipClass(type === t)}`}>
              {TYPE_META[t]?.label}
            </button>
          ))}
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What happened? Write it down before it fades…"
          rows={3}
          className="w-full resize-none"
        />
        <div className="flex justify-end mt-3">
          <Button onClick={submit} disabled={!content.trim() || saving} size="sm">
            <PenLine className="h-4 w-4" />
            {saving ? "Saving…" : "Add entry"}
          </Button>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setFilter("ALL")} className={chipClass(filter === "ALL")}>
          All
        </button>
        {JOURNAL_TYPES.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`capitalize ${chipClass(filter === t)}`}>
            {TYPE_META[t]?.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="rounded-xl border border-dashed bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {filter === "ALL"
                ? "No entries yet. Capture your first thought above."
                : "No entries of this type yet."}
            </p>
          </div>
        )}
        {visible.map((e) => {
          const meta = TYPE_META[e.type];
          const Icon = meta?.icon ?? BookOpen;
          return (
            <div key={e.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
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
                  onClick={() => removeEntry(e.id)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{e.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}