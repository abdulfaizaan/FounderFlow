"use client";

import { useRouter } from "next/navigation";
import { completeTask, unscheduleTask } from "@/lib/actions/tasks";
import { CheckCircle2, Calendar, X } from "lucide-react";

interface ScheduledTask {
  id: string;
  title: string;
  scheduledFor: Date;
  estimateMinutes: number | null;
  milestone: { title: string };
}

export function TodaySchedule({ tasks }: { tasks: ScheduledTask[] }) {
  const router = useRouter();

  if (tasks.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card/40 p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium uppercase tracking-wide">
            Today&apos;s schedule
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Nothing scheduled yet. Use Schedule on a recommendation to plan your day.
        </p>
      </section>
    );
  }

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-medium uppercase tracking-wide">
          Today&apos;s schedule
        </h2>
      </div>
      <div className="relative space-y-0 border-l-2 border-border pl-4">
        {hours.map((hour) => {
          const hourDate = new Date();
          hourDate.setHours(hour, 0, 0, 0);

          const tasksAtHour = tasks.filter(t => {
            const start = new Date(t.scheduledFor);
            return start.getHours() === hour;
          });

          return (
            <div key={hour} className="relative py-3 group">
              <div className="absolute -left-[17px] top-3 w-2.5 h-2.5 rounded-full bg-background border-2 border-border group-hover:border-primary transition-colors" />
              <div className="flex items-center gap-4">
                <span className="w-12 text-xs font-medium text-muted-foreground tabular-nums">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </span>
                <div className="flex-1 space-y-2">
                  {tasksAtHour.map((t) => {
                    const start = new Date(t.scheduledFor);
                    const end = new Date(start.getTime() + (t.estimateMinutes ?? 30) * 60000);

                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - {end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            {" · "}
                            {t.milestone.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async () => {
                              await completeTask(t.id);
                              router.refresh();
                            }}
                            className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Mark done"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              await unscheduleTask(t.id);
                              router.refresh();
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Unschedule"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
