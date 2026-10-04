"use client";

import { CheckCircle2, MessageSquare, DollarSign } from "lucide-react";

export interface WeekBucket {
  label: string;
  tasksDone: number;
  evidence: number;
  revenue: number;
}

function BarChart({
  weeks,
  metric,
  colorClass,
  Icon,
  format,
}: {
  weeks: WeekBucket[];
  metric: "tasksDone" | "evidence" | "revenue";
  colorClass: string;
  Icon: React.ComponentType<{ className?: string }>;
  format: (v: number) => string;
}) {
  const max = Math.max(1, ...weeks.map((w) => w[metric] as number));
  return (
    <div>
      <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span>{formatLabel(metric)}</span>
      </h3>
      <div className="flex items-end gap-1.5 h-36">
        {weeks.map((w, i) => {
          const v = w[metric];
          const h = v === 0 ? 2 : Math.round((v / max) * 100);
          return (
            <div key={w.label} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {format(v)}
              </span>
              <div
                className={`w-full max-w-9 rounded-t-lg ${colorClass} transition-all duration-200 hover:brightness-110`}
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-muted-foreground w-full text-center truncate">
                {i % 2 === 0 ? w.label : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatLabel(metric: "tasksDone" | "evidence" | "revenue"): string {
  switch (metric) {
    case "tasksDone":
      return "Tasks completed";
    case "evidence":
      return "Evidence recorded";
    case "revenue":
      return "Revenue";
  }
}

export function HistoryView({ weeks }: { weeks: WeekBucket[] }) {
  const totals = weeks.reduce(
    (a, w) => ({
      tasksDone: a.tasksDone + w.tasksDone,
      evidence: a.evidence + w.evidence,
      revenue: a.revenue + w.revenue,
    }),
    { tasksDone: 0, evidence: 0, revenue: 0 }
  );
  const isEmpty = totals.tasksDone === 0 && totals.evidence === 0 && totals.revenue === 0;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Tasks done" value={totals.tasksDone} Icon={CheckCircle2} />
        <Stat label="Evidence entries" value={totals.evidence} Icon={MessageSquare} />
        <Stat label="Revenue" value={`$${totals.revenue.toFixed(0)}`} Icon={DollarSign} />
      </div>

      {isEmpty && (
        <p className="text-sm text-muted-foreground">
          No activity recorded this year yet. Complete tasks and log evidence to see trends here.
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <BarChart weeks={weeks} metric="tasksDone" colorClass="bg-primary/70" Icon={CheckCircle2} format={(v) => `${v}`} />
        </div>
        <div className="rounded-xl border bg-card p-5">
          <BarChart weeks={weeks} metric="evidence" colorClass="bg-muted-foreground/50" Icon={MessageSquare} format={(v) => `${v}`} />
        </div>
        <div className="rounded-xl border bg-card p-5 md:col-span-2">
          <BarChart weeks={weeks} metric="revenue" colorClass="bg-muted-foreground" Icon={DollarSign} format={(v) => `$${v.toFixed(0)}`} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string | number;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}