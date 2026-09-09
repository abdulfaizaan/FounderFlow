import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export interface ContextGap {
  key: string;
  message: string;
  cta: { href: string; label: string };
}

export function ContextGap({ gaps }: { gaps: ContextGap[] }) {
  if (gaps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <p className="text-sm font-semibold">Your plan is missing context</p>
      </div>
      <ul className="space-y-2">
        {gaps.map((gap) => (
          <li key={gap.key} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">{gap.message}</span>
            <Link
              href={gap.cta.href}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
            >
              {gap.cta.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}