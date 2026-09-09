/**
 * Export a founder's data as JSON or CSV. Independent of subscription
 * status so churned founders can always take their data with them.
 */

interface ExportStartup {
  name: string;
  stage: string;
  targetCustomer: string | null;
  goals: {
    id: string;
    title: string;
    targetDate: Date | null;
    targetValue: number | null;
    definitionOfSuccess: string | null;
    milestones: {
      id: string;
      title: string;
      status: string;
      tasks: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        estimateMinutes: number | null;
        dueDate: Date | null;
        scheduledFor: Date | null;
        createdAt: Date;
      }[];
    }[];
  }[];
  standups: { date: Date; yesterday: string | null; today: string | null; blockers: string | null }[];
  evidence: { type: string; value: number | null; note: string | null; recordedAt: Date }[];
  journalEntries: { type: string; content: string; createdAt: Date }[];
}

const iso = (d: Date | null | undefined) => (d ? new Date(d).toISOString() : "");

export function buildExportData(startup: ExportStartup) {
  return {
    exportedAt: new Date().toISOString(),
    startup: {
      name: startup.name,
      stage: startup.stage,
      targetCustomer: startup.targetCustomer,
    },
    goals: startup.goals.map((g) => ({
      title: g.title,
      targetDate: iso(g.targetDate),
      targetValue: g.targetValue,
      definitionOfSuccess: g.definitionOfSuccess,
      milestones: g.milestones.map((m) => ({
        title: m.title,
        status: m.status,
        tasks: m.tasks.map((t) => ({
          title: t.title,
          description: t.description,
          status: t.status,
          estimateMinutes: t.estimateMinutes,
          dueDate: iso(t.dueDate),
          scheduledFor: iso(t.scheduledFor),
          createdAt: iso(t.createdAt),
        })),
      })),
    })),
    standups: startup.standups.map((s) => ({
      date: iso(s.date),
      yesterday: s.yesterday,
      today: s.today,
      blockers: s.blockers,
    })),
    evidence: startup.evidence.map((e) => ({
      recordedAt: iso(e.recordedAt),
      type: e.type,
      value: e.value,
      note: e.note,
    })),
    journal: startup.journalEntries.map((j) => ({
      createdAt: iso(j.createdAt),
      type: j.type,
      content: j.content,
    })),
  };
}

export function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "No records";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h])).join(","));
  }
  return lines.join("\n");
}

export function toSectionedCSV(data: ReturnType<typeof buildExportData>): string {
  const sections: [string, Record<string, unknown>[]][] = [
    ["Goal", data.goals.map((g) => ({ title: g.title, targetDate: g.targetDate, definitionOfSuccess: g.definitionOfSuccess }))],
    [
      "Tasks",
      data.goals.flatMap((g) =>
        g.milestones.flatMap((m) =>
          m.tasks.map((t) => ({ milestone: m.title, title: t.title, status: t.status, estimateMinutes: t.estimateMinutes, dueDate: t.dueDate }))
        )
      ),
    ],
    ["Standups", data.standups.map((s) => ({ date: s.date, yesterday: s.yesterday, today: s.today, blockers: s.blockers }))],
    ["Evidence", data.evidence.map((e) => ({ recordedAt: e.recordedAt, type: e.type, value: e.value, note: e.note }))],
    ["Journal", data.journal.map((j) => ({ createdAt: j.createdAt, type: j.type, content: j.content }))],
  ];

  const parts: string[] = [];
  for (const [name, rows] of sections) {
    parts.push(`# ${name}`, rowsToCSV(rows), "");
  }
  return parts.join("\n");
}