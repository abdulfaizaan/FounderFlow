"use client";

import { useRouter } from "next/navigation";
import { completeTask } from "@/lib/actions/tasks";
import { unscheduleTask } from "@/lib/actions/tasks";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, X, Clock } from "lucide-react";

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
      <section className="rounded-2xl border border-dashed bg-card/40 p-6">
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
    <section className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-medium uppercase tracking-wide">
          Today&apos;s schedule
        </h2>
      </div>
      <div className="relative space-y-0 border-l-2 border-muted pl-4">
        {hours.map((hour) => {
          const hourDate = new Date();
          hourDate.setHours(hour, 0, 0, 0);

          const tasksAtHour = tasks.filter(t => {
            const start = new Date(t.scheduledFor);
            return start.getHours() === hour;
          });

          return (
            <div key={hour} className="relative py-3 group">
              <div className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-card border-2 border-muted group-hover:border-primary transition-colors" />
              <div className="flex items-center gap-4">
                <span className="w-12 text-xs font-semibold text-muted-foreground tabular-nums">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </span>
                <div className="flex-1 space-y-2">
                  {tasksAtHour.map((t) => {
                    const start = new Date(t.scheduledFor);
                    const end = new Date(start.getTime() + (t.estimateMinutes ?? 30) * 60000);

                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/50"
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
                      </motion.div>
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
