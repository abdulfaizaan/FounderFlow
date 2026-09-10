"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createTask,
  updateTask,
  deleteTask,
  snoozeTask,
} from "@/lib/actions/tasks";
import {
  createMilestone,
  checkMilestoneCompletion,
} from "@/lib/actions/milestones";
import { Pencil, Archive, Plus, CheckCircle2, Trash2, AlarmClock } from "lucide-react";
import { useTransition } from "react";

export interface ManagedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  estimateMinutes: number | null;
  dueDate: Date | null;
}

export interface ManagedMilestone {
  id: string;
  title: string;
  status: string;
  tasks: ManagedTask[];
}

const STATUSES = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED", "SNOOZED"];

const STATUS_META: Record<string, { label: string; className: string }> = {
  TODO: { label: "Todo", className: "text-muted-foreground" },
  IN_PROGRESS: { label: "In progress", className: "text-[#0099ff]" },
  DONE: { label: "Done", className: "text-[#19a874]" },
  BLOCKED: { label: "Blocked", className: "text-destructive" },
  SNOOZED: { label: "Snoozed", className: "text-amber-600" },
  ARCHIVED: { label: "Archived", className: "text-muted-foreground line-through" },
};

function toDateInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function TaskManager({
  goal,
  milestones,
}: {
  goal: { id: string; title: string };
  milestones: ManagedMilestone[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ title: "", estimate: "", due: "", priority: "MEDIUM" });
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [newTaskEstimate, setNewTaskEstimate] = useState<Record<string, string>>({});
  const [newTaskPriority, setNewTaskPriority] = useState<Record<string, string>>({});
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneTask, setNewMilestoneTask] = useState("");
  const [completionNote, setCompletionNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NONE" | "PRIORITY" | "DATE">("NONE");

  const refresh = () => router.refresh();

  const setStatus = async (taskId: string, status: string, milestoneId: string, milestoneTitle: string) => {
    startTransition(async () => {
      if (status === "ARCHIVED") {
        await deleteTask(taskId);
        refresh();
        return;
      }
      await updateTask(taskId, { status });
      if (status === "DONE") {
        const result = await checkMilestoneCompletion(milestoneId);
        if (result.allDone) setCompletionNote(`"${milestoneTitle}" — all tasks done. Review your milestone.`);
      }
      refresh();
    });
  };

  const snooze = async (taskId: string) => {
    startTransition(async () => {
      await snoozeTask(taskId);
      refresh();
    });
  };

  const startEdit = (t: ManagedTask) => {
    setEditingId(t.id);
    setEdit({ title: t.title, estimate: t.estimateMinutes ? String(t.estimateMinutes) : "", due: toDateInput(t.dueDate), priority: t.priority });
  };

  const saveEdit = async (taskId: string) => {
    startTransition(async () => {
      await updateTask(taskId, {
        title: edit.title.trim() || undefined,
        estimateMinutes: edit.estimate ? parseInt(edit.estimate) : undefined,
        dueDate: edit.due || undefined,
        priority: edit.priority,
      });
      setEditingId(null);
      refresh();
    });
  };

  const addTask = async (milestoneId: string) => {
    const title = newTaskTitle[milestoneId]?.trim();
    if (!title) return;
    const est = newTaskEstimate[milestoneId]?.trim();
    startTransition(async () => {
      await createTask({
        milestoneId,
        title,
        estimateMinutes: est ? parseInt(est) : undefined,
        priority: newTaskPriority[milestoneId] || "MEDIUM",
      });
      setNewTaskTitle((s) => ({ ...s, [milestoneId]: "" }));
      setNewTaskEstimate((s) => ({ ...s, [milestoneId]: "" }));
      setNewTaskPriority((s) => ({ ...s, [milestoneId]: "MEDIUM" }));
      refresh();
    });
  };

  const addMilestone = async () => {
    const title = newMilestoneTitle.trim();
    const taskTitle = newMilestoneTask.trim();
    if (!title) return;
    const milestone = await createMilestone({ goalId: goal.id, title });
    if (taskTitle) {
      await createTask({ milestoneId: milestone.id, title: taskTitle });
    }
    setNewMilestoneTitle("");
    setNewMilestoneTask("");
    refresh();
  };

  return (
    <div className="space-y-6">
      {completionNote && (
        <div className="rounded-2xl border border-[#19a874]/30 bg-[#19a874]/5 p-4 flex items-start justify-between gap-3">
          <p className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#19a874] shrink-0" />
            {completionNote}
          </p>
          <button onClick={() => setCompletionNote(null)} className="text-muted-foreground hover:text-foreground">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{goal.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {milestones.length} milestone{milestones.length === 1 ? "" : "s"} ·{" "}
            {milestones.reduce((a, m) => a + m.tasks.length, 0)} tasks
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="NONE">Default Sort</option>
            <option value="PRIORITY">Sort by Priority</option>
            <option value="DATE">Sort by Due Date</option>
          </select>
        </div>
      </div>

      {milestones.map((m) => {
        const allDone = m.tasks.length > 0 && m.tasks.every((t) => t.status === "DONE");

        const filteredTasks = m.tasks.filter(t => filterStatus === "ALL" || t.status === filterStatus);
        const sortedTasks = [...filteredTasks].sort((a, b) => {
          if (sortBy === "PRIORITY") {
            const priorityMap: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            return (priorityMap[a.priority] ?? 1) - (priorityMap[b.priority] ?? 1);
          }
          if (sortBy === "DATE") {
            return (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity);
          }
          return 0;
        });

        return (
          <section key={m.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">{m.title}</h3>
              {allDone && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-[#19a874]/10 text-[#0f7a54] px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Complete
                </span>
              )}
            </div>

            <div className="space-y-2">
              {sortedTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks match the filter.</p>
              )}
              {sortedTasks.map((t) => {
                return (
                  <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl border bg-background/60 px-3 py-2">
                    {editingId === t.id ? (
                      <>
                        <input
                          value={edit.title}
                          onChange={(e) => setEdit((s) => ({ ...s, title: e.target.value }))}
                          className="flex-1 rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                        <input
                          type="number"
                          value={edit.estimate}
                          onChange={(e) => setEdit((s) => ({ ...s, estimate: e.target.value }))}
                          placeholder="min"
                          className="w-16 rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                        <input
                          type="date"
                          value={edit.due}
                          onChange={(e) => setEdit((s) => ({ ...s, due: e.target.value }))}
                          className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                        />
                        <button
                          onClick={() => saveEdit(t.id)}
                          className="text-sm font-medium text-primary hover:bg-primary/10 rounded-lg px-2 py-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm text-muted-foreground hover:text-foreground px-2 py-1"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${
                              t.priority === "HIGH" ? "bg-destructive" :
                              t.priority === "MEDIUM" ? "bg-amber-500" : "bg-muted-foreground"
                            }`} />
                            <p className={`text-sm font-medium truncate ${STATUS_META[t.status]?.className ?? ""}`}>
                              {t.title}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground ml-3">
                            {t.estimateMinutes ? `${t.estimateMinutes} min` : "No estimate"}
                            {t.dueDate ? ` · Due ${toDateInput(t.dueDate)}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => snooze(t.id)}
                            disabled={t.status === "DONE" || isPending}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                            title="Snooze to tomorrow"
                          >
                            <AlarmClock className="h-3.5 w-3.5" />
                          </button>
                          <select
                            value={t.status}
                            onChange={(e) => setStatus(t.id, e.target.value, m.id, m.title)}
                            className="rounded-lg border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                            title="Change status"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_META[s].label}
                              </option>
                            ))}
                            <option value="ARCHIVED">Archive</option>
                          </select>
                          <button
                            onClick={() => startEdit(t)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Edit task"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                            title="Archive task"
                            >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
              <input
                value={newTaskTitle[m.id] ?? ""}
                onChange={(e) => setNewTaskTitle((s) => ({ ...s, [m.id]: e.target.value }))}
                placeholder="Add task..."
                className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <input
                type="number"
                value={newTaskEstimate[m.id] ?? ""}
                onChange={(e) => setNewTaskEstimate((s) => ({ ...s, [m.id]: e.target.value }))}
                placeholder="min"
                className="w-16 rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <button
                onClick={() => addTask(m.id)}
                disabled={!newTaskTitle[m.id]?.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </section>
        );
      })}

      <section className="rounded-2xl border border-dashed bg-card/40 p-4">
        <h3 className="text-sm font-semibold mb-3">New milestone</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={newMilestoneTitle}
            onChange={(e) => setNewMilestoneTitle(e.target.value)}
            placeholder="Milestone title"
            className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <input
            value={newMilestoneTask}
            onChange={(e) => setNewMilestoneTask(e.target.value)}
            placeholder="First task (optional)"
            className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <button
            onClick={addMilestone}
            disabled={!newMilestoneTitle.trim()}
            className="inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </section>
    </div>
  );
}