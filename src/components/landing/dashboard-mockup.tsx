import { Sparkles, Calendar, CheckCircle2 } from "lucide-react";

/** Static, decorative dashboard mockup for the landing hero. Not interactive. */
export function DashboardMockup() {
  return (
    <div className="relative">
      {/* Ambient teal glow behind the window */}
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.10),transparent_65%)] blur-3xl pointer-events-none" />

      <div className="relative rounded-xl border border-border bg-card shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/40" />
          <span className="ml-3 text-[11px] font-medium text-muted-foreground tabular-nums">
            founderflow — today
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* Goal banner */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <div className="pl-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Current goal
              </p>
              <p className="mt-1 text-sm font-bold leading-snug">
                Ship MVP to 50 beta users
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1">
                  <Calendar className="h-3 w-3" />
                  Target: Nov 15
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                  42 days left
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:border-primary/20">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                Top recommendation
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                45 min
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug">
              Cold-email 10 design partners
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Milestone: User research
            </p>
            <div className="mt-3 flex gap-2">
              <span className="border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground rounded-lg">
                Schedule
              </span>
              <span className="inline-flex items-center gap-1 bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground rounded-lg">
                <CheckCircle2 className="h-3 w-3" />
                Done
              </span>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3 text-primary" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wide">
                Today&apos;s schedule
              </h3>
            </div>
            <div className="mt-3 space-y-0 border-l-2 border-border pl-4">
              <div className="relative py-1">
                <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full border-2 border-border bg-background" />
                <span className="flex items-center gap-2.5">
                  <span className="w-10 text-[11px] font-medium text-muted-foreground tabular-nums">
                    9 AM
                  </span>
                  <span className="text-xs font-medium">Design partner interviews</span>
                </span>
              </div>
              <div className="relative py-1">
                <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <span className="flex items-center gap-2.5">
                  <span className="w-10 text-[11px] font-medium text-muted-foreground tabular-nums">
                    11 AM
                  </span>
                  <span className="text-xs font-medium">Refine onboarding copy</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}