"use client";

import { useState } from "react";
import { JournalView } from "./journal-view";
import { WikiView } from "./wiki-view";
import { cn } from "@/lib/utils";

type NotesTab = "journal" | "wiki";

const TABS: { id: NotesTab; label: string }[] = [
  { id: "journal", label: "Journal" },
  { id: "wiki", label: "Wiki" },
];

export function NotesView({
  entries,
  initialStructure,
  startupId,
  defaultTab = "journal",
}: {
  entries: { id: string; type: string; content: string; createdAt: Date }[];
  initialStructure: {
    folders: { id: string; name: string; parentId: string | null }[];
    pages: { id: string; title: string; folderId: string | null }[];
  };
  startupId: string;
  defaultTab?: NotesTab;
}) {
  const [tab, setTab] = useState<NotesTab>(defaultTab);

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Notes sections"
        className="flex w-fit rounded-lg border border-border bg-card p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "journal" ? (
        <JournalView entries={entries} />
      ) : (
        <WikiView initialStructure={initialStructure} startupId={startupId} />
      )}
    </div>
  );
}