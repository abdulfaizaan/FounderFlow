import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { CardHelp } from "./card-help";

export interface ContextGap {
  key: string;
  message: string;
  cta: { href: string; label: string };
}

export function ContextGap({ gaps }: { gaps: ContextGap[] }) {
  if (gaps.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">Your plan is missing context</p>
        <CardHelp title="Missing context">
          Recommendations are only as good as the data behind them. Each item below is
          something missing from your setup — fix it and your daily picks get sharper.
        </CardHelp>
      </div>
      <ul className="space-y-2">
        {gaps.map((gap) => (
          <li key={gap.key} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">{gap.message}</span>
            <Link
              href={gap.cta.href}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {gap.cta.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}