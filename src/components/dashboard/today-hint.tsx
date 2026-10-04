"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

const KEY = "fh:today-hint-dismissed";

/** First-run hint on Today; remembers dismissal in localStorage. */
export function TodayHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-muted-foreground">
        This is your focus-first dashboard: today&apos;s goal, recommendation, and schedule up
        top — Plan, check-ins, copilot, and your week are under <strong>Beyond today</strong>.
        Every card has a <strong>?</strong> that explains what it does.
      </p>
      <button
        type="button"
        aria-label="Dismiss hint"
        onClick={() => {
          localStorage.setItem(KEY, "1");
          setVisible(false);
        }}
        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}